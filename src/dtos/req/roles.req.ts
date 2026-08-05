/** Request body for POST /SuperAdminRoles */
export type CreateRolePayload = {
  roleName: string;
  description?: string | null;
};

/** Request body for PUT /SuperAdminRoles/{roleId}/permissions */
export type AssignPermissionsPayload = {
  permissionIds: number[];
};

/** @deprecated Use AssignPermissionsPayload with PUT /SuperAdminRoles/{roleId}/permissions */
export type LegacyAssignPermissionsPayload = {
  roleId: number;
  permissionIds?: number[] | null;
};
