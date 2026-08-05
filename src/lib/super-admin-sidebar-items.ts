import { getDummyOrganization } from "@/lib/dummy-organizations";
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
    label: "Pricing",
    href: "/pricing",
    icon: "lucide:tag",
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: "lucide:credit-card",
  },
  {
    label: "Writing Assistant",
    href: "/chatbot",
    icon: "lucide:sparkles",
  },
];

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
    const companyName =
      getDummyOrganization(orgSite.company)?.name ?? "Admin";
    sections.push(...getOrgAdminNavSections(pathname, companyName));
  }
  return sections;
}

export function getSuperAdminSidebarLogoHref(): string {
  return `${SUPER_ADMIN_BASE_PATH}/dashboard`;
}
