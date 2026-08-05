export interface SubItem {
  label: string;
  href: string;
  description: string;
  icon: string;
  iconBg: string;
}

export interface NavItem {
  label: string;
  href: string;
  dropdownItems?: SubItem[];
}

export const navItems: NavItem[] = [
  {
    label: "Solutions",
    href: "",
    dropdownItems: [
      {
        label: "Incident & Safety",
        href: "/incident-and-safety",
        description:
          "Report, investigate, and close incidents, with CAPA that sticks.",
        icon: "lucide:shield-check",
        iconBg: "bg-red-100 text-red-700",
      },
      {
        label: "Audit & Compliance",
        href: "/audit-and-compliance",
        description:
          "Stay audit-ready with scheduled inspections and linked evidence.",
        icon: "lucide:file-check",
        iconBg: "bg-amber-100 text-amber-700",
      },
      {
        label: "People & Health",
        href: "/people-and-health",
        description:
          "Training, fitness, and skills readiness before work starts.",
        icon: "lucide:user-check",
        iconBg: "bg-blue-100 text-blue-700",
      },
      {
        label: "Operation & Assets",
        href: "/operation-and-assets",
        description:
          "MOC, LOTO, and asset integrity without slowing production.",
        icon: "lucide:building",
        iconBg: "bg-green-100 text-green-700",
      },
      {
        label: "Environment & ESG",
        href: "/environment-and-esg",
        description:
          "Emissions, waste, and spill response with board-ready proof.",
        icon: "lucide:leaf",
        iconBg: "bg-purple-100 text-purple-700",
      },
      {
        label: "Intelligence & AI",
        href: "/intelligence-and-ai",
        description:
          "Classify hazards, surface trends, and act on leading indicators.",
        icon: "lucide:brain",
        iconBg: "bg-purple-100 text-purple-700",
      },
    ],
  },
  {
    label: "Industries",
    href: "",
    dropdownItems: [
      {
        label: "Construction",
        href: "/construction",
        description: "Manage your construction operations",
        icon: "lucide:building",
        iconBg: "bg-red-100 text-red-700",
      },
      {
        label: "Logistic and Fleet",
        href: "/logistic-and-fleet",
        description: "Manage your logistic and fleet operations",
        icon: "lucide:truck",
        iconBg: "bg-blue-100 text-blue-700",
      },
      {
        label: "Manufacturing",
        href: "/manufacturing",
        description: "Manage your manufacturing operations",
        icon: "lucide:factory",
        iconBg: "bg-green-100 text-green-700",
      },
      {
        label: "Oil and Gas",
        href: "/oil-and-gas",
        description: "Manage your oil and gas operations",
        icon: "game-icons:oil-drum",
        iconBg: "bg-yellow-100 text-yellow-700",
      },
      {
        label: "Robotics",
        href: "/robotics",
        description: "Safety for robotics and automation facilities",
        icon: "lucide:bot",
        iconBg: "bg-slate-100 text-slate-700",
      },
    ],
  },
  {
    label: "Why Neptune",
    href: "/why-neptune",
  },
  {
    label: "Customers",
    href: "/customers",
  },
  {
    label: "Resources",
    href: "/blogs",
  },
];
