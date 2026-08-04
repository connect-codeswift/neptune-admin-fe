export type SidebarNavItem = {
  label: string;
  href: string;
  icon: string;
  /** When true, only highlight on an exact pathname match (e.g. dashboard root). */
  exact?: boolean;
};

export type SidebarNavSection = {
  label: string;
  items: SidebarNavItem[];
};

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
  {
    label: "Regulations",
    href: "/regulation-library",
    icon: "lucide:book-open",
  },
  {
    label: "PPE Catalog",
    href: "/ppe-catalog",
    icon: "lucide:hard-hat",
  },
  {
    label: "LOTO Procedures",
    href: "/loto-procedures",
    icon: "lucide:lock",
  },
  {
    label: "Permit Templates",
    href: "/permit-templates",
    icon: "lucide:clipboard-clock",
  },
];

const STATIC_ROOT_SEGMENTS = new Set([
  "login",
  "forgot-password",
  "reset-password",
  "add-a-company",
  "client-accounts",
  "dashboard",
]);

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

function prefixNavItems(
  basePath: string,
  items: SidebarNavItem[],
): SidebarNavItem[] {
  return items.map((item) => ({
    ...item,
    href: item.href === "/dashboard" ? basePath : `${basePath}${item.href}`,
    exact: item.exact ?? item.href === "/dashboard",
  }));
}

export function getAdminNavSections(pathname: string): SidebarNavSection[] {
  const orgSite = parseOrgSitePath(pathname);
  if (orgSite) {
    const basePath = buildOrgSiteBasePath(orgSite.company, orgSite.site);
    return [
      {
        label: "Admin",
        items: prefixNavItems(basePath, ORG_ADMIN_NAV_ITEMS),
      },
    ];
  }

  return [
    {
      label: "Super Admin",
      items: SUPER_ADMIN_NAV_ITEMS,
    },
  ];
}
