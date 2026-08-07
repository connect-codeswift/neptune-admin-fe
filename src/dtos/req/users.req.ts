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
  /** What the person does. Distinct from the role, which decides what they may do. */
  jobTitle?: string | null;
  /** Legacy single-site field the API still accepts as a one-element `siteIds`. */
  siteId?: number | null;
  /** Sites the invitee may work in. The first becomes their active site. */
  siteIds?: number[];
};

/** Request body for PUT /SuperAdminUsers/{userId} */
export type UpdateSuperAdminUserPayload = {
  fullName?: string | null;
  gender?: string | null;
  contactNo?: string | null;
  /** Empty string clears it; omitted leaves it as it was. */
  jobTitle?: string | null;
  roleId?: number | null;
  /** Legacy single-site field: moves the active site without dropping the others. */
  siteId?: number | null;
  /** Full replace of the user's site assignments. */
  siteIds?: number[];
};
