export type SidebarNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type SidebarNavSection = {
  label: string;
  items: SidebarNavItem[];
};

export const CLIENT_ONBOARDING_NAV_ITEMS: SidebarNavItem[] = [
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

export const SUPER_ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "lucide:layout-dashboard",
  },
  {
    label: "User Management",
    href: "/users-management",
    icon: "tabler:user",
  },
  {
    label: "Roles & Permissions",
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

export const DEFAULT_ADMIN_NAV_SECTIONS: SidebarNavSection[] = [
  {
    label: "Client Onboarding",
    items: CLIENT_ONBOARDING_NAV_ITEMS,
  },
  {
    label: "Super Admin",
    items: SUPER_ADMIN_NAV_ITEMS,
  },
];
