"use client";

import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { getDummyOrganization } from "@/lib/dummy-organizations";
import { getAllSitesOfThisOrg, replaceSiteInPath } from "@/lib/org-sites";
import { parseOrgSitePath } from "@/lib/sidebar-items";

export function HeaderSiteChanger() {
  const pathname = usePathname();
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const orgSite = parseOrgSitePath(pathname);
  const sites = orgSite ? getAllSitesOfThisOrg(orgSite.company) : [];
  const company = orgSite ? getDummyOrganization(orgSite.company) : undefined;
  const currentSite = orgSite
    ? (sites.find((site) => site.id === orgSite.site) ?? sites[0])
    : undefined;
  const companyLabel = company?.name ?? "organization";
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

  const handleSelect = (siteId: string) => {
    if (siteId === orgSite.site) {
      setOpen(false);
      return;
    }
    router.push(replaceSiteInPath(pathname, orgSite.company, siteId));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`Switch site for ${companyLabel}. Current site: ${currentSite.name}`}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 max-w-56 items-center gap-2 rounded-xl border border-darkest/10 bg-white px-3.5 text5 text-darkest shadow-lg outline-none transition-colors hover:border-darkest/16 focus-visible:ring-2 focus-visible:ring-blue-normal/30"
      >
        <Icon
          icon="lucide:map-pin"
          width={18}
          height={18}
          className="shrink-0 text-darkest/55"
          aria-hidden
        />
        <span className="min-w-0 truncate whitespace-nowrap">
          {currentSite.name}
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
        <div
          id={listboxId}
          role="listbox"
          aria-label={`Sites for ${companyLabel}`}
          className="absolute top-[calc(100%+0.375rem)] right-0 z-30 min-w-64 max-w-80 overflow-hidden rounded-xl border border-darkest/10 bg-white py-1 shadow-xl"
        >
          {sites.map((site) => {
            const isSelected = site.id === orgSite.site;
            return (
              <button
                key={site.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(site.id)}
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
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
