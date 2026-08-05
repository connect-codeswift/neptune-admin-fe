import { DUMMY_ORGANIZATIONS } from "@/lib/dummy-organizations";
import { DEFAULT_SUBSCRIPTIONS } from "@/lib/dummy-subscriptions";

export type SuperAdminDashboardKpi = {
  value: string | number;
  label: string;
  trendLabel: string;
  trend: "up" | "down";
  data: number[];
};

export type SuperAdminPlatformStat = {
  title: string;
  value: number;
  activeCount: number;
};

export type SuperAdminCompanyRow = {
  id: string;
  name: string;
  code: string;
  industry: string;
  sites: number;
  users: number;
  employees: number;
  status: "active" | "inactive";
  csm: string;
  plan: string;
};

export type SuperAdminActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

const totalCompanies = DUMMY_ORGANIZATIONS.length;
const activeCompanies = DUMMY_ORGANIZATIONS.filter(
  (org) => org.status === "active",
).length;
const totalSites = DUMMY_ORGANIZATIONS.reduce(
  (sum, org) => sum + org.siteCount,
  0,
);
const totalLicensedUsers = DUMMY_ORGANIZATIONS.reduce(
  (sum, org) => sum + org.subscription.seats.used,
  0,
);
const totalEmployees = DUMMY_ORGANIZATIONS.reduce(
  (sum, org) => sum + org.employeeCount,
  0,
);
const trialAccounts = DUMMY_ORGANIZATIONS.filter((org) =>
  org.subscription.statusLabel.toLowerCase().includes("trial"),
).length;

export const SUPER_ADMIN_DASHBOARD_KPIS: SuperAdminDashboardKpi[] = [
  {
    value: totalCompanies,
    label: "Total Companies",
    trendLabel: "+2",
    trend: "up",
    data: [1, 1, 2, 2, 2, 3, totalCompanies],
  },
  {
    value: totalLicensedUsers,
    label: "Licensed Users",
    trendLabel: "+18",
    trend: "up",
    data: [95, 102, 110, 118, 125, 132, totalLicensedUsers],
  },
  {
    value: totalSites,
    label: "Total Sites",
    trendLabel: "+1",
    trend: "up",
    data: [8, 9, 10, 10, 11, 11, totalSites],
  },
  {
    value: activeCompanies,
    label: "Active Companies",
    trendLabel: "30d",
    trend: "up",
    data: [1, 1, 2, 2, 2, 2, activeCompanies],
  },
];

export const SUPER_ADMIN_PLATFORM_STATS: SuperAdminPlatformStat[] = [
  {
    title: "Platform Employees",
    value: totalEmployees,
    activeCount: totalEmployees,
  },
  {
    title: "Trial Accounts",
    value: trialAccounts,
    activeCount: trialAccounts,
  },
  {
    title: "Enterprise Plans",
    value: DUMMY_ORGANIZATIONS.filter((org) =>
      org.contract.planType.toLowerCase().includes("enterprise"),
    ).length,
    activeCount: activeCompanies,
  },
  {
    title: "Assigned CSMs",
    value: new Set(DUMMY_ORGANIZATIONS.map((org) => org.assignedCsm)).size,
    activeCount: activeCompanies,
  },
  {
    title: "Licensed Modules",
    value: DEFAULT_SUBSCRIPTIONS.reduce(
      (sum, subscription) => sum + subscription.modules.length,
      0,
    ),
    activeCount: DEFAULT_SUBSCRIPTIONS.filter(
      (subscription) => subscription.status === "active",
    ).reduce((sum, subscription) => sum + subscription.modules.length, 0),
  },
];

export const SUPER_ADMIN_COMPANY_ROWS: SuperAdminCompanyRow[] =
  DUMMY_ORGANIZATIONS.map((org) => ({
    id: org.id,
    name: org.name,
    code: org.code,
    industry: org.industry,
    sites: org.siteCount,
    users: org.subscription.seats.used,
    employees: org.employeeCount,
    status: org.status,
    csm: org.assignedCsm,
    plan: org.contract.planType,
  }));

export const SUPER_ADMIN_ACTIVITY_LOG: SuperAdminActivityItem[] = [
  {
    id: "g1",
    actor: "Rachel Torres",
    action: "Onboarded new company",
    target: "Meridian Chemical Co.",
    time: "12 min ago",
  },
  {
    id: "g2",
    actor: "System",
    action: "Trial converted to paid",
    target: "1X Technologies",
    time: "45 min ago",
  },
  {
    id: "g3",
    actor: "James Okafor",
    action: "Added site",
    target: "1X Technologies — Corpus Christi Terminal",
    time: "1 hr ago",
  },
  {
    id: "g4",
    actor: "Rachel Torres",
    action: "Extended trial",
    target: "Harrington Logistics",
    time: "3 hr ago",
  },
  {
    id: "g5",
    actor: "System",
    action: "Seat limit reached",
    target: "Meridian Chemical Co. (50/50)",
    time: "5 hr ago",
  },
  {
    id: "g6",
    actor: "Platform Admin",
    action: "Updated global module catalog",
    target: "LOTO Procedures",
    time: "Yesterday",
  },
];

export function getSuperAdminDashboardSummary() {
  return {
    totalCompanies,
    activeCompanies,
    totalSites,
    totalLicensedUsers,
    totalEmployees,
    trialAccounts,
  };
}
