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

/** GET /SuperAdminUsers */
export async function getUsers(params?: GetSuperAdminUsersParams) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminUsersPageResponse | SuperAdminUserResponse[]>
  >("/SuperAdminUsers", { params });
  return data;
}

/** GET /SuperAdminUsers/stats */
export async function getUserStats(params?: Pick<GetSuperAdminUsersParams, "siteId">) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminUsersStatsResponse>>(
    "/SuperAdminUsers/stats",
    { params },
  );
  return data;
}

/** GET /SuperAdminUsers/{id} */
export async function getUserById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminUserResponse>>(
    `/SuperAdminUsers/${id}`,
  );
  return data;
}

/** POST /SuperAdminUsers/invite */
export async function inviteUser(payload: InviteSuperAdminUserPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/SuperAdminUsers/invite",
    payload,
  );
  return data;
}

/** PUT /SuperAdminUsers/{id} */
export async function updateUser(
  id: string | number,
  payload: UpdateSuperAdminUserPayload,
) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/SuperAdminUsers/${id}`,
    payload,
  );
  return data;
}

/** PUT /SuperAdminUsers/{id}/status?isDrop= */
export async function updateUserStatus(
  id: string | number,
  isDrop: boolean | string,
) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/SuperAdminUsers/${id}/status`,
    undefined,
    { params: { isDrop } },
  );
  return data;
}
