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

export type SuperAdminSiteMutationOptions = {
  organizationId?: number;
  useStaffToken?: boolean;
};

function resolveMutationConfig(options?: SuperAdminSiteMutationOptions) {
  const useStaffToken =
    options?.useStaffToken ?? (options?.organizationId != null && options.organizationId > 0);

  return {
    useStaffToken,
    organizationId: options?.organizationId,
  };
}

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
export async function createSuperAdminSite(
  payload: CreateSuperAdminSitePayload,
  options?: SuperAdminSiteMutationOptions,
) {
  const { useStaffToken, organizationId } = resolveMutationConfig(options);
  const body =
    organizationId != null && organizationId > 0
      ? { ...payload, organizationId }
      : payload;

  const { data } = await axiosInstance.post<ApiResponse<SuperAdminSiteResponse>>(
    "/SuperAdminSites",
    body,
    { neptuneUseStaffToken: useStaffToken },
  );
  return data;
}

/** PUT /SuperAdminSites/{siteId} */
export async function updateSuperAdminSite(
  siteId: number,
  payload: UpdateSuperAdminSitePayload,
  options?: SuperAdminSiteMutationOptions,
) {
  const { useStaffToken, organizationId } = resolveMutationConfig(options);

  const { data } = await axiosInstance.put<ApiResponse<SuperAdminSiteResponse>>(
    `/SuperAdminSites/${siteId}`,
    payload,
    {
      neptuneUseStaffToken: useStaffToken,
      params:
        organizationId != null && organizationId > 0
          ? { organizationId }
          : undefined,
    },
  );
  return data;
}

/** DELETE /SuperAdminSites/{siteId} */
export async function deleteSuperAdminSite(
  siteId: number,
  options?: SuperAdminSiteMutationOptions,
) {
  const { useStaffToken, organizationId } = resolveMutationConfig(options);

  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    `/SuperAdminSites/${siteId}`,
    {
      neptuneUseStaffToken: useStaffToken,
      params:
        organizationId != null && organizationId > 0
          ? { organizationId }
          : undefined,
    },
  );
  return data;
}
