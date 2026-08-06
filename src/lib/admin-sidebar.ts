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
    label: "Site Management",
    href: "/site-management",
    icon: "lucide:map-pin",
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
  {
    label: "PPE Catalog",
    href: "/ppe-catalog",
    icon: "lucide:hard-hat",
  },
];

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

export function getAdminSidebarLogoHref(pathname: string): string {
  const orgSite = parseOrgSitePath(pathname);
  if (orgSite) {
    return `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/dashboard`;
  }

  return "/dashboard";
}
