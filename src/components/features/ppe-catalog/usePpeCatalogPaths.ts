"use client";

import { usePathname } from "next/navigation";
import { buildOrgSitePath } from "@/lib/org-sites";
import {
  buildOrgSiteBasePath,
  parseOrgSitePath,
} from "@/lib/sidebar-items";

export function usePpeCatalogPaths() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const adminHref = orgSite
    ? buildOrgSitePath(orgSite.company, orgSite.site)
    : "/dashboard";
  const basePath = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/ppe-catalog`
    : "/ppe-catalog";

  return { adminHref, basePath };
}
