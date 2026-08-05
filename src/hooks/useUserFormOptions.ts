"use client";

import { useMemo } from "react";
import { useRolesWithPermissions } from "@/hooks/useRolesAndRights";
import { getAllSitesOfThisOrg } from "@/lib/org-sites";
import { getTenantContext } from "@/lib/tenant-context";
import { parseOrgSitePath } from "@/lib/sidebar-items";
import { usePathname } from "next/navigation";

export function useUserFormOptions() {
  const pathname = usePathname();
  const orgSite = parseOrgSitePath(pathname);
  const { data: roles = [], isLoading: rolesLoading } = useRolesWithPermissions();
  const context = getTenantContext();

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: String(role.numericId),
        label: role.name,
      })),
    [roles],
  );

  const siteOptions = useMemo(() => {
    const sites = orgSite ? getAllSitesOfThisOrg(orgSite.company) : [];
    return sites.map((site) => ({
      value: site.id,
      label: site.name,
    }));
  }, [orgSite]);

  const defaultSiteId =
    context?.siteId != null
      ? String(context.siteId)
      : (siteOptions[0]?.value ?? "");

  return {
    roleOptions,
    siteOptions,
    defaultSiteId,
    rolesLoading,
  };
}
