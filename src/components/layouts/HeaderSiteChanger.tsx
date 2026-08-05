"use client";

import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getAllSitesOfThisOrg,
  getOrganizationName,
  replaceSiteInPath,
} from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import { switchOrganizationSite } from "@/lib/select-company-flow";
import { getTenantContext } from "@/lib/tenant-context";

export function HeaderSiteChanger() {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const orgSite = parseOrgSitePath(pathname);
  const sites = orgSite ? getAllSitesOfThisOrg(orgSite.company) : [];
  const companyLabel =
    getOrganizationName(orgSite?.company ?? "") ?? "organization";
  const currentSite = orgSite
    ? (sites.find((site) => site.id === orgSite.site) ?? sites[0])
    : undefined;
  const visible = orgSite !== null && sites.length > 0;

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
      await switchOrganizationSite({
        organizationId: context.organizationId,
        organizationName: context.organizationName,
        siteId: Number(siteId),
        sites: context.sites,
      });
      router.push(replaceSiteInPath(pathname, orgSite.company, siteId));
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
        className="inline-flex h-11 max-w-56 items-center gap-2 rounded-xl border border-darkest/10 bg-white px-3.5 text5 text-darkest shadow-lg outline-none transition-colors hover:border-darkest/16 focus-visible:ring-2 focus-visible:ring-blue-normal/30 disabled:opacity-60"
      >
        <Icon
          icon="lucide:map-pin"
          width={18}
          height={18}
          className="shrink-0 text-darkest/55"
          aria-hidden
        />
        <span className="min-w-0 truncate whitespace-nowrap">
          {switching ? "Switching…" : currentSite.name}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={18}
          height={18}
          className="shrink-0 text-darkest/40"
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={`Sites for ${companyLabel}`}
          className="absolute top-[calc(100%+0.375rem)] right-0 z-30 min-w-64 max-w-80 overflow-hidden rounded-xl border border-darkest/10 bg-white py-1 shadow-xl"
        >
          {sites.map((site) => {
            const isSelected = site.id === orgSite.site;
            return (
              <li key={site.id} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleSelect(site.id)}
                className={`flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-lightgray ${
                  isSelected ? "bg-blue-normal/8" : ""
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text5 ${
                      isSelected
                        ? "font-semibold text-blue-normal"
                        : "text-darkest"
                    }`}
                  >
                    {site.name}
                  </p>
                  <p className="truncate text7 text-gray">{site.type}</p>
                </div>
                {isSelected ? (
                  <Icon
                    icon="mdi:check"
                    width={18}
                    height={18}
                    className="mt-0.5 shrink-0 text-blue-normal"
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
