export type SuperAdminUserStatus = "Active" | "Pending" | "Suspended";

/** GET /SuperAdminUsers list item — shape from ADMIN_DASHBOARD_FE_GUIDE.md */
export type SuperAdminUserResponse = {
  id: number;
  fullName?: string | null;
  gender?: string | null;
  email: string;
  contactNo?: string | null;
  profileUrl?: string | null;
  roleId: number;
  roleName: string;
  siteId?: number | null;
  siteName?: string | null;
  siteLocation?: string | null;
  isDrop?: boolean;
  isInvited?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
  status?: SuperAdminUserStatus;
};

export type SuperAdminUsersStatsResponse = {
  totalUsers: number;
  active: number;
  pendingSetup: number;
  suspended: number;
};

export type SuperAdminUsersPageResponse = {
  data?: SuperAdminUserResponse[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
};
