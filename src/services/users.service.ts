import type {
  GetSuperAdminUsersParams,
  InviteSuperAdminUserPayload,
  UpdateSuperAdminUserPayload,
} from "@/dtos/req/users.req";
import type {
  SuperAdminUserResponse,
  SuperAdminUsersPageResponse,
  SuperAdminUsersStatsResponse,
} from "@/dtos/res/users.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** GET /v1/super-admin/users */
export async function getUsers(params?: GetSuperAdminUsersParams) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminUsersPageResponse | SuperAdminUserResponse[]>
  >("/v1/super-admin/users", { params });
  return data;
}

/** GET /v1/super-admin/users/stats */
export async function getUserStats(params?: Pick<GetSuperAdminUsersParams, "siteId">) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminUsersStatsResponse>>(
    "/v1/super-admin/users/stats",
    { params },
  );
  return data;
}

/** GET /v1/super-admin/users/{id} */
export async function getUserById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminUserResponse>>(
    `/v1/super-admin/users/${id}`,
  );
  return data;
}

/** POST /v1/super-admin/users/invite */
export async function inviteUser(payload: InviteSuperAdminUserPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/super-admin/users/invite",
    payload,
  );
  return data;
}

/** PUT /v1/super-admin/users/{id} */
export async function updateUser(
  id: string | number,
  payload: UpdateSuperAdminUserPayload,
) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/v1/super-admin/users/${id}`,
    payload,
  );
  return data;
}

/** PUT /v1/super-admin/users/{id}/status?isDrop= */
export async function updateUserStatus(
  id: string | number,
  isDrop: boolean | string,
) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/v1/super-admin/users/${id}/status`,
    undefined,
    { params: { isDrop } },
  );
  return data;
}
