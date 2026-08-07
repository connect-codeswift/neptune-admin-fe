export type SuperAdminUserStatus = "Active" | "Pending" | "Suspended";

/** One of a user's assigned sites, as returned in `sites[]`. */
export type UserSiteResponse = {
  id: number;
  siteName?: string | null;
  location?: string | null;
};

/** GET /SuperAdminUsers list item — shape from ADMIN_DASHBOARD_FE_GUIDE.md */
export type SuperAdminUserResponse = {
  id: number;
  fullName?: string | null;
  gender?: string | null;
  email: string;
  contactNo?: string | null;
  profileUrl?: string | null;
  /** What the person does. Null until someone sets it. */
  jobTitle?: string | null;
  roleId: number;
  roleName: string;
  /** Active site — what the user's token carries until they switch. */
  siteId?: number | null;
  siteName?: string | null;
  siteLocation?: string | null;
  /** Every site the user is assigned to, including the active one. */
  sites?: UserSiteResponse[] | null;
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
