/** Query params for GET /SuperAdminUsers */
export type GetSuperAdminUsersParams = {
  siteId?: number;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** Request body for POST /SuperAdminUsers/invite */
export type InviteSuperAdminUserPayload = {
  email: string;
  roleId: number;
  fullName?: string | null;
  gender?: string | null;
  siteId?: number | null;
};

/** Request body for PUT /SuperAdminUsers/{userId} */
export type UpdateSuperAdminUserPayload = {
  fullName?: string | null;
  gender?: string | null;
  contactNo?: string | null;
  roleId?: number | null;
  siteId?: number | null;
};
