"use client";

import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getAllSitesOfThisOrg,
  getOrganizationName,
  replaceSiteInPath,
} from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import {
  switchOrganizationSite,
  switchTenantAdminSite,
} from "@/lib/select-company-flow";
import {
  getTenantContext,
  TENANT_CONTEXT_CHANGED_EVENT,
} from "@/lib/tenant-context";
import { isAdminRole, isSuperAdminRole } from "@/lib/auth-tokens";

export function HeaderSiteChanger() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  // localStorage is empty on the server; seed after mount so tenant-admin
  // hydration of Org/me can reveal the switcher without a full reload.
  const [sitesVersion, setSitesVersion] = useState(0);

  const orgSite = parseOrgSitePath(pathname);
  void sitesVersion;
  const sites = orgSite ? getAllSitesOfThisOrg(orgSite.company) : [];
  const companyLabel =
    getOrganizationName(orgSite?.company ?? "") ?? "organization";
  const currentSite = orgSite
    ? (sites.find((site) => site.id === orgSite.site) ?? sites[0])
    : undefined;
  // SuperAdmin staff and multi-site tenant Admins both need this. Single-site
  // Admins still see it when their cache has one entry — the menu is a no-op.
  const visible =
    (isSuperAdminRole() || isAdminRole()) &&
    orgSite !== null &&
    sites.length > 0;

  useEffect(() => {
    const bump = () => setSitesVersion((version) => version + 1);
    bump();
    window.addEventListener(TENANT_CONTEXT_CHANGED_EVENT, bump);
    return () =>
      window.removeEventListener(TENANT_CONTEXT_CHANGED_EVENT, bump);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!visible || !orgSite || !currentSite) return null;

  const handleSelect = async (siteId: string) => {
    if (siteId === orgSite.site || switching) {
      setOpen(false);
      return;
    }

    const context = getTenantContext();
    if (!context) {
      toast.error("Organization context is missing. Please re-select a company.");
      setOpen(false);
      return;
    }

    setSwitching(true);
    try {
      if (isAdminRole()) {
        await switchTenantAdminSite(Number(siteId));
      } else {
        await switchOrganizationSite({
          organizationId: context.organizationId,
          organizationName: context.organizationName,
          siteId: Number(siteId),
          sites: context.sites,
        });
      }
      // Full navigation so no site-scoped React Query data or client state survives.
      queryClient.clear();
      window.location.assign(
        replaceSiteInPath(pathname, orgSite.company, siteId),
      );
      return;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to switch site.",
      );
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Switch site for ${companyLabel}. Current site: ${currentSite.name}`}
        onClick={() => setOpen((current) => !current)}
        disabled={switching}
        className="text4 inline-flex h-11 max-w-56 cursor-pointer items-center gap-2 rounded-xl border border-ehs-border bg-ehs-surface px-3.5 text-ehs-darker shadow-(--ehs-shadow-card) outline-none transition-colors hover:border-ehs-border-strong focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon
          icon="lucide:map-pin"
          width={18}
          height={18}
          className="shrink-0 text-ehs-muted-text"
          aria-hidden
        />
        <span className="min-w-0 truncate whitespace-nowrap">
          {switching ? "Switching…" : currentSite.name}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={18}
          height={18}
          className="shrink-0 text-ehs-muted-text"
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={`Sites for ${companyLabel}`}
          className="absolute top-[calc(100%+0.375rem)] right-0 z-30 min-w-64 max-w-80 overflow-hidden rounded-xl border border-ehs-border bg-ehs-surface py-1 shadow-(--ehs-shadow-popover)"
        >
          {sites.map((site) => {
            const isSelected = site.id === orgSite.site;
            return (
              <li key={site.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSelect(site.id)}
                  className={`flex w-full cursor-pointer items-start justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-ehs-light-bg ${
                    isSelected ? "bg-ehs-light-blue" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text4 truncate ${
                        isSelected
                          ? "font-semibold text-ehs-normal-blue"
                          : "text-ehs-darker"
                      }`}
                    >
                      {site.name}
                    </p>
                    <p className="text8 truncate text-ehs-muted-text">{site.type}</p>
                  </div>
                  {isSelected ? (
                    <Icon
                      icon="mdi:check"
                      width={18}
                      height={18}
                      className="mt-0.5 shrink-0 text-ehs-normal-blue"
                      aria-hidden
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
