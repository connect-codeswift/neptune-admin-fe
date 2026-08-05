import type {
  CreateSuperAdminSitePayload,
  UpdateSuperAdminSitePayload,
} from "@/dtos/req/companies.req";
import type {
  SuperAdminSiteResponse,
  SuperAdminSitesListResponse,
} from "@/dtos/res/sites.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

export type GetSuperAdminSitesParams = {
  includeDeleted?: boolean;
};

/** GET /SuperAdminSites */
export async function getSuperAdminSites(params?: GetSuperAdminSitesParams) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminSitesListResponse>
  >("/SuperAdminSites", { params });
  return data;
}

/** GET /SuperAdminSites/{siteId} */
export async function getSuperAdminSite(siteId: number) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminSiteResponse>>(
    `/SuperAdminSites/${siteId}`,
  );
  return data;
}

/** POST /SuperAdminSites */
export async function createSuperAdminSite(payload: CreateSuperAdminSitePayload) {
  const { data } = await axiosInstance.post<ApiResponse<SuperAdminSiteResponse>>(
    "/SuperAdminSites",
    payload,
  );
  return data;
}

/** PUT /SuperAdminSites/{siteId} */
export async function updateSuperAdminSite(
  siteId: number,
  payload: UpdateSuperAdminSitePayload,
) {
  const { data } = await axiosInstance.put<ApiResponse<SuperAdminSiteResponse>>(
    `/SuperAdminSites/${siteId}`,
    payload,
  );
  return data;
}

/** DELETE /SuperAdminSites/{siteId} */
export async function deleteSuperAdminSite(siteId: number) {
  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    `/SuperAdminSites/${siteId}`,
  );
  return data;
}
