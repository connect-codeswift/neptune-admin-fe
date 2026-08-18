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

/** GET /v1/super-admin/sites */
export async function getSuperAdminSites(params?: GetSuperAdminSitesParams) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminSitesListResponse>
  >("/v1/super-admin/sites", { params });
  return data;
}

/** GET /v1/super-admin/sites/{siteId} */
export async function getSuperAdminSite(siteId: number) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminSiteResponse>>(
    `/v1/super-admin/sites/${siteId}`,
  );
  return data;
}

/** POST /v1/super-admin/sites */
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
    "/v1/super-admin/sites",
    body,
    { neptuneUseStaffToken: useStaffToken },
  );
  return data;
}

/** PUT /v1/super-admin/sites/{siteId} */
export async function updateSuperAdminSite(
  siteId: number,
  payload: UpdateSuperAdminSitePayload,
  options?: SuperAdminSiteMutationOptions,
) {
  const { useStaffToken, organizationId } = resolveMutationConfig(options);

  const { data } = await axiosInstance.put<ApiResponse<SuperAdminSiteResponse>>(
    `/v1/super-admin/sites/${siteId}`,
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

/** DELETE /v1/super-admin/sites/{siteId} */
export async function deleteSuperAdminSite(
  siteId: number,
  options?: SuperAdminSiteMutationOptions,
) {
  const { useStaffToken, organizationId } = resolveMutationConfig(options);

  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    `/v1/super-admin/sites/${siteId}`,
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
