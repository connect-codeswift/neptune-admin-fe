import axiosInstance from "@/lib/axiosInstance";
import type { ApiPayload, ApiResponse } from "@/types/api.types";

/** GET /SuperAdminRoles */
export async function getRoles() {
  const { data } = await axiosInstance.get<ApiResponse>("/SuperAdminRoles");
  return data;
}

/** GET /SuperAdminRoles/with-permissions */
export async function getRolesWithPermissions() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/SuperAdminRoles/with-permissions",
  );
  return data;
}

/** GET /SuperAdminRoles/permissions */
export async function getPermissions() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/SuperAdminRoles/permissions",
  );
  return data;
}

/** POST /SuperAdminRoles */
export async function createRole(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/SuperAdminRoles",
    payload,
  );
  return data;
}

/** PUT /SuperAdminRoles/{id}/permissions */
export async function updateRolePermissions(
  id: string | number,
  payload: ApiPayload,
) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/SuperAdminRoles/${id}/permissions`,
    payload,
  );
  return data;
}

/** Create role then assign permissions (POST role → PUT permissions). */
export async function createRoleWithPermissions(
  rolePayload: ApiPayload,
  permissionsPayload: ApiPayload,
  getCreatedRoleId: (response: ApiResponse) => string | number,
) {
  const created = await createRole(rolePayload);
  const roleId = getCreatedRoleId(created);
  const permissions = await updateRolePermissions(roleId, permissionsPayload);
  return { created, permissions };
}

/**
 * DELETE /SuperAdminRoles/{id}
 *
 * Anyone holding the role is moved to No_Permission and has no access until reassigned.
 * The backend refuses Ehs_Director and the shared preset roles.
 */
export async function deleteRole(id: string | number) {
  const { data } = await axiosInstance.delete<ApiResponse>(
    `/SuperAdminRoles/${id}`,
  );
  return data;
}
