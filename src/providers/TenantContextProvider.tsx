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

  const openPicker = useCallback(
    (organizationId?: number, siteId?: number) => {
      setInitialOrganizationId(organizationId);
      setInitialSiteId(siteId);
      setPickerOpen(true);
    },
    [],
  );

  const ensureOrgContext = useCallback(async () => {
    if (!orgSite) {
      setChecking(false);
      return;
    }

    const organizationId = Number(orgSite.company);
    const siteId = Number(orgSite.site);
    if (!Number.isFinite(organizationId) || !Number.isFinite(siteId)) {
      setChecking(false);
      return;
    }

    // Tenant Admins never call select-company; hydrate their site list from
    // Org/me so the header switcher can offer every site they are assigned to.
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
      const company = companies.find((entry) => entry.id === organizationId);
      if (!company) {
        openPicker(organizationId, siteId);
        return;
      }

      await enterOrganization({
        organizationId,
        organizationName: company.name,
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
  }, [openPicker, orgSite]);

  useEffect(() => {
    void ensureOrgContext();
  }, [ensureOrgContext]);

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
      <CompanySitePickerModal
        open={pickerOpen}
        required
        initialOrganizationId={initialOrganizationId}
        initialSiteId={initialSiteId}
        onSuccess={handlePickerSuccess}
      />
    </>
  );
}
