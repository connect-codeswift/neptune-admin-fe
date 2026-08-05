export type DashboardUserStats = {
  total: number;
  active: number;
  pendingSetup: number;
  suspended: number;
};

export type DashboardSiteStats = {
  total: number;
};

export type DashboardRoleStats = {
  total: number;
  custom: number;
};

export type DashboardAccessStats = {
  expiresAt: string | null;
  daysRemaining: number | null;
  isPermanent: boolean;
};

export type DashboardModuleStats = {
  modules: string | null;
  moduleCount: number;
};

export type DashboardOrganizationInfo = {
  id: number;
  name: string;
  createdAt: string;
};

export type SuperAdminDashboardSummaryResponse = {
  users: DashboardUserStats;
  sites: DashboardSiteStats;
  roles: DashboardRoleStats;
  access: DashboardAccessStats;
  activatedModules: DashboardModuleStats;
  organization: DashboardOrganizationInfo;
};

export type SuperAdminRecentActivityItem = {
  type: "AccessWindow" | "UserInvited" | string;
  description: string;
  occurredAt: string;
  actor: string | null;
};

export type SuperAdminRecentActivityResponse = SuperAdminRecentActivityItem[];
