import type {
  AssignPermissionsPayload,
  CreateRolePayload,
} from "@/dtos/req/roles.req";
import type {
  CreateRoleResponse,
  PermissionResponse,
  RoleResponse,
  RoleWithPermissionsResponse,
} from "@/dtos/res/roles.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

export type GetSuperAdminRolesParams = {
  pageNumber?: number;
  pageSize?: number;
};

/** GET /v1/super-admin/roles */
export async function getAllRoles(params?: GetSuperAdminRolesParams) {
  const { data } = await axiosInstance.get<ApiResponse<RoleResponse[]>>(
    "/v1/super-admin/roles",
    { params },
  );
  return data;
}

/** GET /v1/super-admin/roles/permissions */
export async function getAllPermissions() {
  const { data } = await axiosInstance.get<ApiResponse<PermissionResponse[]>>(
    "/v1/super-admin/roles/permissions",
  );
  return data;
}

/** GET /v1/super-admin/roles/with-permissions */
export async function getAllRolesPermissions() {
  const { data } = await axiosInstance.get<
    ApiResponse<RoleWithPermissionsResponse[]>
  >("/v1/super-admin/roles/with-permissions");
  return data;
}

/** POST /v1/super-admin/roles */
export async function createRole(payload: CreateRolePayload) {
  const { data } = await axiosInstance.post<ApiResponse<CreateRoleResponse>>(
    "/v1/super-admin/roles",
    payload,
  );
  return data;
}

/** PUT /v1/super-admin/roles/{roleId}/permissions — full replace */
export async function assignRolePermissions(
  roleId: number,
  payload: AssignPermissionsPayload,
) {
  const { data } = await axiosInstance.put<ApiResponse<unknown>>(
    `/v1/super-admin/roles/${roleId}/permissions`,
    payload,
  );
  return data;
}

/** @deprecated Use assignRolePermissions */
export async function assignPermissions(input: {
  roleId: number;
  permissionIds: number[];
}) {
  return assignRolePermissions(input.roleId, {
    permissionIds: input.permissionIds,
  });
}

/**
 * DELETE /v1/super-admin/roles/{roleId}
 *
 * Anyone holding the role is moved to No_Permission and has no access at all until they
 * are given another one. The backend refuses Ehs_Director and the shared preset roles.
 */
export async function deleteRole(roleId: number) {
  const { data } = await axiosInstance.delete<ApiResponse>(
    `/v1/super-admin/roles/${roleId}`,
  );
  return data;
}
