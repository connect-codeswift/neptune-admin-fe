import axiosInstance from "@/lib/axiosInstance";
import type { ApiPayload, ApiResponse } from "@/types/api.types";

/** GET /SuperAdminUsers */
export async function getUsers(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>("/SuperAdminUsers", {
    params,
  });
  return data;
}

/** GET /SuperAdminUsers/stats */
export async function getUserStats() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/SuperAdminUsers/stats",
  );
  return data;
}

/** GET /SuperAdminUsers/{id} */
export async function getUserById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/SuperAdminUsers/${id}`,
  );
  return data;
}

/** POST /SuperAdminUsers/invite */
export async function inviteUser(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/SuperAdminUsers/invite",
    payload,
  );
  return data;
}

/** PUT /SuperAdminUsers/{id} */
export async function updateUser(id: string | number, payload: ApiPayload) {
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
