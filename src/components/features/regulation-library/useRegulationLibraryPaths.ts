"use client";

import { usePathname } from "next/navigation";
import {
  buildOrgSiteBasePath,
  parseOrgSitePath,
} from "@/lib/sidebar-items";

export function useRegulationLibraryPaths() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const adminHref = orgSite
    ? buildOrgSiteBasePath(orgSite.company, orgSite.site)
    : "/dashboard";
  const basePath = orgSite
    ? `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/regulation-library`
    : "/regulation-library";

  return { adminHref, basePath };
}
