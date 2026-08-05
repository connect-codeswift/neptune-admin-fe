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

/** GET /SuperAdminRoles */
export async function getAllRoles(params?: GetSuperAdminRolesParams) {
  const { data } = await axiosInstance.get<ApiResponse<RoleResponse[]>>(
    "/SuperAdminRoles",
    { params },
  );
  return data;
}

/** GET /SuperAdminRoles/permissions */
export async function getAllPermissions() {
  const { data } = await axiosInstance.get<ApiResponse<PermissionResponse[]>>(
    "/SuperAdminRoles/permissions",
  );
  return data;
}

/** GET /SuperAdminRoles/with-permissions */
export async function getAllRolesPermissions() {
  const { data } = await axiosInstance.get<
    ApiResponse<RoleWithPermissionsResponse[]>
  >("/SuperAdminRoles/with-permissions");
  return data;
}

/** POST /SuperAdminRoles */
export async function createRole(payload: CreateRolePayload) {
  const { data } = await axiosInstance.post<ApiResponse<CreateRoleResponse>>(
    "/SuperAdminRoles",
    payload,
  );
  return data;
}

/** PUT /SuperAdminRoles/{roleId}/permissions — full replace */
export async function assignRolePermissions(
  roleId: number,
  payload: AssignPermissionsPayload,
) {
  const { data } = await axiosInstance.put<ApiResponse<unknown>>(
    `/SuperAdminRoles/${roleId}/permissions`,
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
