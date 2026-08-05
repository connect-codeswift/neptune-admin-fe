/** GET /SuperAdminRoles list item */
export type RoleResponse = {
  id: number;
  roleName: string;
  description?: string | null;
  permissionCount?: number;
  isSystem: boolean;
  usersAssigned: number;
};

/** GET /SuperAdminRoles/permissions item */
export type PermissionResponse = {
  id: number;
  displayName: string;
  categoryId: number;
  categoryName: string;
  /** Legacy fields kept for mapper fallbacks */
  permissionName?: string | null;
  name?: string | null;
  description?: string | null;
  module?: string | null;
  group?: string | null;
  category?: string | null;
  isLocked?: boolean | null;
};

/** GET /SuperAdminRoles/with-permissions item */
export type RoleWithPermissionsResponse = RoleResponse & {
  permissions?: PermissionResponse[] | null;
  permissionIds?: number[] | null;
};

export type RolesPageResponse = {
  data?: RoleResponse[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
};

/** POST /SuperAdminRoles response */
export type CreateRoleResponse = RoleResponse | number;
