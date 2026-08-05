import type { StoredAuthRole } from "@/lib/auth-tokens";
import { getDummyOrganization } from "@/lib/dummy-organizations";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: string;
  /** When true, only highlight on an exact pathname match (e.g. dashboard root). */
  exact?: boolean;
  /** Shows a subtle preview badge — route has no backend yet. */
  preview?: boolean;
};

export type SidebarNavSection = {
  label: string;
  items: SidebarNavItem[];
};

const SUPER_ADMIN_BASE_PATH = "/super";

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

/** Org/site admin nav — lives under /{company}/{site}/… */
export const ORG_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "lucide:layout-dashboard",
    exact: true,
  },
  {
    label: "User Management",
    href: "/user-management",
    icon: "tabler:user",
  },
  {
    label: "Roles & Rights",
    href: "/roles-and-rights",
    icon: "lucide:shield-check",
  },
  {
    label: "Document Categories",
    href: "/doc-categories",
    icon: "lucide:layers",
  },
  {
    label: "Version History",
    href: "/version-history",
    icon: "lucide:file-clock",
  },
  // {
  //   label: "Regulations",
  //   href: "/regulation-library",
  //   icon: "lucide:book-open",
  //   preview: true,
  // },
  // {
  //   label: "LOTO Procedures",
  //   href: "/loto-procedures",
  //   icon: "lucide:lock",
  //   preview: true,
  // },
  {
    label: "PPE Catalog",
    href: "/ppe-catalog",
    icon: "lucide:hard-hat",
  },
];

const STATIC_ROOT_SEGMENTS = new Set([
  "login",
  "super",
  "forgot-password",
  "reset-password",
  "add-a-company",
  "client-accounts",
  "pricing",
  "subscriptions",
  "chatbot",
  "dashboard",
]);

export function prefixNavItems(
  basePath: string,
  items: SidebarNavItem[],
): SidebarNavItem[] {
  return items.map((item) => ({
    ...item,
    href:
      item.href === "/dashboard"
        ? `${basePath}/dashboard`
        : `${basePath}${item.href}`,
    exact: item.exact ?? item.href === "/dashboard",
  }));
}

export function parseOrgSitePath(
  pathname: string,
): { company: string; site: string } | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const [company, site] = segments;
  if (!company || !site || STATIC_ROOT_SEGMENTS.has(company)) return null;

  return { company, site };
}

export function buildOrgSiteBasePath(company: string, site: string): string {
  return `/${company}/${site}`;
}

export function getSuperAdminNavSections(): SidebarNavSection[] {
  return [
    {
      label: "Super Admin",
      items: prefixNavItems(SUPER_ADMIN_BASE_PATH, SUPER_ADMIN_NAV_ITEMS),
    },
  ];
}

export function getOrgAdminNavSections(
  pathname: string,
  sectionLabel = "Admin",
): SidebarNavSection[] {
  const orgSite = parseOrgSitePath(pathname);
  if (!orgSite) return [];

  const basePath = buildOrgSiteBasePath(orgSite.company, orgSite.site);
  return [
    {
      label: sectionLabel,
      items: prefixNavItems(basePath, ORG_ADMIN_NAV_ITEMS),
    },
  ];
}

export function getSidebarNavSections(
  pathname: string,
  role: StoredAuthRole | null,
): SidebarNavSection[] {
  if (role === "super-admin") {
    const sections = getSuperAdminNavSections();
    const orgSite = parseOrgSitePath(pathname);
    if (orgSite) {
      const companyName =
        getDummyOrganization(orgSite.company)?.name ?? "Admin";
      sections.push(...getOrgAdminNavSections(pathname, companyName));
    }
    return sections;
  }

  if (role === "admin") return getOrgAdminNavSections(pathname);
  return [];
}

export function getSidebarLogoHref(
  pathname: string,
  role: StoredAuthRole | null,
): string {
  if (role === "super-admin") return `${SUPER_ADMIN_BASE_PATH}/dashboard`;

  const orgSite = parseOrgSitePath(pathname);
  if (orgSite) {
    return `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/dashboard`;
  }

  return "/dashboard";
}
