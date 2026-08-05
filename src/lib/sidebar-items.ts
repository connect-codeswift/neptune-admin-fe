import type { StoredAuthRole } from "@/lib/auth-tokens";
import {
  getAdminSidebarLogoHref,
  getOrgAdminNavSections,
  type SidebarNavItem,
  type SidebarNavSection,
} from "@/lib/admin-sidebar";

export type { SidebarNavItem, SidebarNavSection };
export {
  buildOrgSiteBasePath,
  getOrgAdminNavSections,
  ORG_ADMIN_NAV_ITEMS,
  parseOrgSitePath,
  prefixNavItems,
} from "@/lib/admin-sidebar";
import {
  getSuperAdminCombinedNavSections,
  getSuperAdminNavSections,
  getSuperAdminSidebarLogoHref,
  SUPER_ADMIN_NAV_ITEMS,
} from "@/lib/super-admin-sidebar-items";

export function getSidebarNavSections(
  pathname: string,
  role: StoredAuthRole | null,
): SidebarNavSection[] {
  if (role === "super-admin") {
    return getSuperAdminCombinedNavSections(pathname);
  }

  if (role === "admin") return getOrgAdminNavSections(pathname);
  return [];
}

export function getSidebarLogoHref(
  pathname: string,
  role: StoredAuthRole | null,
): string {
  if (role === "super-admin") return getSuperAdminSidebarLogoHref();

  return getAdminSidebarLogoHref(pathname);
}

export { getAdminSidebarLogoHref, getSuperAdminSidebarLogoHref };
