export type SidebarNavItem = {
  label: string;
  href: string;
  icon: string;
  /** When true, only highlight on an exact pathname match (e.g. dashboard root). */
  exact?: boolean;
  /** Shows a subtle preview badge — route has no backend yet. */
  preview?: boolean;
  /** Live count pill (e.g. unresolved deploy alerts). Hidden when zero. */
  badge?: number;
  /** Accessible description for the count, e.g. "2 unresolved deploy alerts". */
  badgeLabel?: string;
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
  "dashboard",
]);

const ORG_ADMIN_DASHBOARD_ITEM: SidebarNavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: "lucide:layout-dashboard",
  exact: true,
};

/**
 * Org/site admin nav, grouped for the sidebar. The Dashboard-only group's label is
 * left to the caller of `getOrgAdminNavSections` (it's the org name — see below), so
 * only the remaining fixed groups live here.
 */
const ORG_ADMIN_NAV_GROUPS: SidebarNavSection[] = [
  {
    label: "Organization",
    items: [
      { label: "User Management", href: "/users", icon: "tabler:user" },
      { label: "Roles & Rights", href: "/roles", icon: "lucide:shield-check" },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Site Settings", href: "/site-settings", icon: "lucide:map-pin" },
      { label: "Locations", href: "/locations", icon: "lucide:map-pinned" },
      { label: "Departments", href: "/departments", icon: "lucide:building-2" },
    ],
  },
  {
    label: "Registers",
    items: [
      { label: "KPI Targets", href: "/kpi-targets", icon: "lucide:target" },
      // Shortened from "Document Categories" — the sidebar span truncates and was
      // cutting it to "Document Categor…".
      { label: "Doc Categories", href: "/doc-categories", icon: "lucide:layers" },
      { label: "PPE Catalog", href: "/ppe-catalog", icon: "lucide:hard-hat" },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Settings", href: "/settings/profile", icon: "mdi:cog-outline" }],
  },
];

/**
 * Flat list of every org/site admin nav item, derived from the groups above so it
 * can't drift from them. Re-exported by sidebar-items.ts and layouts/index.ts —
 * keep exporting this shape, do not remove it.
 */
export const ORG_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  ORG_ADMIN_DASHBOARD_ITEM,
  ...ORG_ADMIN_NAV_GROUPS.flatMap((group) => group.items),
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
  // The first group's label is the org name (or "Admin" as a fallback), not a fixed
  // category — a SuperAdmin browsing a client's portal relies on that heading to know
  // whose dashboard they're looking at, so it can't be hardcoded like the rest.
  return [
    { label: sectionLabel, items: prefixNavItems(basePath, [ORG_ADMIN_DASHBOARD_ITEM]) },
    ...ORG_ADMIN_NAV_GROUPS.map((group) => ({
      label: group.label,
      items: prefixNavItems(basePath, group.items),
    })),
  ];
}

export function getAdminSidebarLogoHref(pathname: string): string {
  const orgSite = parseOrgSitePath(pathname);
  if (orgSite) {
    return `${buildOrgSiteBasePath(orgSite.company, orgSite.site)}/dashboard`;
  }

  return "/dashboard";
}
