"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanySitePickerModal } from "@/components/features/super-admin/CompanySitePickerModal";
import { ORG_TOKEN_RESELECT_EVENT } from "@/lib/api-error";
import {
  getAuthRole,
  getOrgToken,
  isAdminRole,
  isSuperAdminRole,
} from "@/lib/auth-tokens";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import {
  ensureTenantAdminContext,
  enterOrganization,
  fetchCompanies,
} from "@/lib/select-company-flow";
import { getTenantContext } from "@/lib/tenant-context";

type TenantContextProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export function TenantContextProvider({ children }: TenantContextProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [initialOrganizationId, setInitialOrganizationId] = useState<number>();
  const [initialSiteId, setInitialSiteId] = useState<number>();
  const [checking, setChecking] = useState(true);

  const orgSite = parseOrgSitePath(pathname);
  // parseOrgSitePath returns a brand-new object every call, so anything that keys off
  // `orgSite` itself (a useEffect/useCallback dependency, in particular) re-runs on every
  // navigation even when the org/site did not change. These primitives are what the effect
  // below actually depends on.
  const company = orgSite?.company;
  const site = orgSite?.site;

  const openPicker = useCallback(
    (organizationId?: number, siteId?: number) => {
      setInitialOrganizationId(organizationId);
      setInitialSiteId(siteId);
      setPickerOpen(true);
    },
    [],
  );

  useEffect(() => {
    // This is a real side effect — it reads the token store, may fetch, and mints an org
    // token. Several of its paths (already-valid token, non-super-admin) reach a
    // `setChecking(false)` before their first await, which would run synchronously inside
    // this effect and cascade a second render. Starting it on a microtask keeps every state
    // update it makes asynchronous, which is how an effect is meant to talk back to React.
    //
    // The dependency array is `[company, site, openPicker]`, not `[orgSite]`: two renders at
    // the same URL produce equal strings even though `orgSite` is a new object each time, so
    // navigating within the same [company]/[site] no longer re-runs this check (and therefore
    // never re-arms `checking`) — only a genuine org or site change does. Each branch below
    // still checks the cached token/context *before* calling `setChecking(true)`, so a
    // navigation that lands here with an already-valid context resolves to `checking=false`
    // without ever blanking the shell.
    async function ensureOrgContext() {
      if (!company || !site) {
        setChecking(false);
        return;
      }

      const organizationId = Number(company);
      const siteId = Number(site);
      if (!Number.isFinite(organizationId) || !Number.isFinite(siteId)) {
        setChecking(false);
        return;
      }

      // Ehs_Director tenant admins (stored role 'admin') never call select-company;
      // hydrate their site list from Org/me so the header switcher can offer every
      // site they are assigned to. Ehs_Lead is rejected by the admin portal login
      // gate, so this path is never reached by a site authority.
      if (isAdminRole()) {
        const context = getTenantContext();
        const contextReady =
          context?.organizationId === organizationId &&
          context.sites.length > 0 &&
          Boolean(getOrgToken());

        if (contextReady) {
          setChecking(false);
          return;
        }

        setChecking(true);
        try {
          await ensureTenantAdminContext();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load your organization sites.",
          );
        } finally {
          setChecking(false);
        }
        return;
      }

      if (!isSuperAdminRole()) {
        setChecking(false);
        return;
      }

      const orgToken = getOrgToken();
      const context = getTenantContext();
      const contextMatches =
        context?.organizationId === organizationId &&
        context?.siteId === siteId;

      if (orgToken && contextMatches) {
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const companies = await fetchCompanies();
        const matchedCompany = companies.find(
          (entry) => entry.id === organizationId,
        );
        if (!matchedCompany) {
          openPicker(organizationId, siteId);
          return;
        }

        await enterOrganization({
          organizationId,
          organizationName: matchedCompany.name,
          siteId,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Select a company and site to continue.",
        );
        openPicker(organizationId, siteId);
      } finally {
        setChecking(false);
      }
    }

    queueMicrotask(() => void ensureOrgContext());
  }, [company, site, openPicker]);

  useEffect(() => {
    const handleReselect = () => {
      const role = getAuthRole();
      if (role === "super-admin") {
        const currentOrgSite = parseOrgSitePath(window.location.pathname);
        openPicker(
          currentOrgSite ? Number(currentOrgSite.company) : undefined,
          currentOrgSite ? Number(currentOrgSite.site) : undefined,
        );
        return;
      }

      router.replace("/login");
    };

    window.addEventListener(ORG_TOKEN_RESELECT_EVENT, handleReselect);
    return () =>
      window.removeEventListener(ORG_TOKEN_RESELECT_EVENT, handleReselect);
  }, [openPicker, router]);

  const handlePickerSuccess = (path: string) => {
    setPickerOpen(false);
    if (pathname !== path) {
      router.push(path);
    } else {
      router.refresh();
    }
  };

  // Deliberately does NOT consult isSuperAdminRole() here. That reads
  // localStorage, which does not exist during SSR, so the server rendered the
  // dashboard while the client's first render showed this placeholder and React
  // discarded the whole tree. `checking` and `orgSite` are identical on both
  // sides, so gating on them alone hydrates cleanly and still keeps children
  // from mounting — and firing org-scoped queries — before select-company has
  // minted the org token. ensureOrgContext clears `checking` immediately for
  // anyone who is not a SuperAdmin, so they see this for a single tick.
  if (checking && orgSite) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text5 text-gray">
        Preparing organization context…
      </div>
    );
  }

  return (
    <>
      {children}
      {/*
        The picker keeps its own org/site selection in state, seeded from these
        props. Remounting on every (re)open is what resets that selection —
        the modal used to do it by writing state from an effect, which cost an
        extra render pass on each open.
      */}
      <CompanySitePickerModal
        key={`${String(pickerOpen)}-${String(initialOrganizationId)}-${String(initialSiteId)}`}
        open={pickerOpen}
        required
        initialOrganizationId={initialOrganizationId}
        initialSiteId={initialSiteId}
        onSuccess={handlePickerSuccess}
      />
    </>
  );
}
