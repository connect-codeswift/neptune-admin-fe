import { getOrganizationName } from "@/lib/org-sites";
import {
  getOrgAdminNavSections,
  parseOrgSitePath,
  prefixNavItems,
  type SidebarNavItem,
  type SidebarNavSection,
} from "@/lib/admin-sidebar";

export const SUPER_ADMIN_BASE_PATH = "/super";

/** Super-admin shell: dashboard + client onboarding only. */
export const SUPER_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "lucide:layout-dashboard",
    exact: true,
  },
  {
    label: "Add a Company",
    href: "/add-a-company",
    icon: "lucide:building-2",
  },
  {
    label: "Client Accounts",
    href: "/client-accounts",
    icon: "lucide:briefcase",
  },
  {
    label: "Deployments",
    href: "/deployments",
    icon: "lucide:rocket",
  },
  {
    label: "Settings",
    href: "/settings/profile",
    icon: "mdi:cog-outline",
  },
];

export const SUPER_ADMIN_DEPLOYMENTS_HREF = `${SUPER_ADMIN_BASE_PATH}/deployments`;

/**
 * Stamps the unresolved deploy-alert count onto the Deployments item. Kept out
 * of the nav definition so the sidebar stays a pure function of the pathname.
 */
export function withDeployAlertBadge(
  sections: SidebarNavSection[],
  count: number,
): SidebarNavSection[] {
  if (count <= 0) return sections;

  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.href !== SUPER_ADMIN_DEPLOYMENTS_HREF) return item;
      return { ...item, badge: count, badgeLabel: `${count} unresolved deploy alerts` };
    }),
  }));
}

export function getSuperAdminNavSections(): SidebarNavSection[] {
  return [
    {
      label: "Super Admin",
      items: prefixNavItems(SUPER_ADMIN_BASE_PATH, SUPER_ADMIN_NAV_ITEMS),
    },
  ];
}

/** Super-admin sections plus org sections when browsing a client org. */
export function getSuperAdminCombinedNavSections(
  pathname: string,
): SidebarNavSection[] {
  const sections = getSuperAdminNavSections();
  const orgSite = parseOrgSitePath(pathname);
  if (orgSite) {
    // Real name from the tenant context written at select-company.
    // getDummyOrganization was keyed by the *real* organization id, so browsing
    // organization 1 labelled the section with dummy org "1" — every company
    // showed up as "Meridian Chemical Co.". Falls back to "Admin" before the
    // context resolves, never to another company's name.
    const companyName = getOrganizationName(orgSite.company) ?? "Admin";
    sections.push(...getOrgAdminNavSections(pathname, companyName));
  }
  return sections;
}

export function getSuperAdminSidebarLogoHref(): string {
  return `${SUPER_ADMIN_BASE_PATH}/dashboard`;
}
