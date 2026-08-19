import type {
  SetAccessWindowPayload,
  SetOrganizationLimitsPayload,
  UpdateActivatedModulesPayload,
  UpdateCompanyProfilePayload,
} from "@/dtos/req/companies.req";
import type {
  AccessHistoryRow,
  AccessWindowResponse,
  LimitHistoryRow,
  OrganizationLimitsResponse,
  SuperAdminCompanyDetailResponse,
} from "@/dtos/res/companies.res";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** GET /v1/super-admin/companies/{organizationId} */
export async function getCompanyById(organizationId: number) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/v1/super-admin/companies/${organizationId}`);
  return data;
}

export type GetCompanySitesParams = {
  includeDeleted?: boolean;
};

/** GET /v1/super-admin/companies/{organizationId}/sites */
export async function getCompanySites(
  organizationId: number,
  params?: GetCompanySitesParams,
) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminSiteRow[]>>(
    `/v1/super-admin/companies/${organizationId}/sites`,
    { params },
  );
  return data;
}

/** PUT /v1/super-admin/companies/{organizationId} */
export async function updateCompany(
  organizationId: number,
  payload: UpdateCompanyProfilePayload,
) {
  const { data } = await axiosInstance.put<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/v1/super-admin/companies/${organizationId}`, payload);
  return data;
}

/** PUT /v1/super-admin/companies/{organizationId}/modules */
export async function updateCompanyModules(
  organizationId: number,
  payload: UpdateActivatedModulesPayload,
) {
  const { data } = await axiosInstance.put<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/v1/super-admin/companies/${organizationId}/modules`, payload);
  return data;
}

/** POST /v1/super-admin/companies/{organizationId}/access */
export async function setCompanyAccessWindow(
  organizationId: number,
  payload: SetAccessWindowPayload,
) {
  const { data } = await axiosInstance.post<ApiResponse<AccessWindowResponse>>(
    `/v1/super-admin/companies/${organizationId}/access`,
    payload,
    { neptuneUseStaffToken: true },
  );
  return data;
}

/** DELETE /v1/super-admin/companies/{organizationId}/access */
export async function clearCompanyAccessWindow(organizationId: number) {
  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    `/v1/super-admin/companies/${organizationId}/access`,
    { neptuneUseStaffToken: true },
  );
  return data;
}

/** GET /v1/super-admin/companies/{organizationId}/access/history */
export async function getCompanyAccessHistory(organizationId: number) {
  const { data } = await axiosInstance.get<ApiResponse<AccessHistoryRow[]>>(
    `/v1/super-admin/companies/${organizationId}/access/history`,
  );
  return data;
}

/** PUT /v1/super-admin/companies/{organizationId}/limits */
export async function setOrganizationLimits(
  organizationId: number,
  payload: SetOrganizationLimitsPayload,
) {
  const { data } = await axiosInstance.put<
    ApiResponse<OrganizationLimitsResponse>
  >(`/v1/super-admin/companies/${organizationId}/limits`, payload, {
    neptuneUseStaffToken: true,
  });
  return data;
}

/** GET /v1/super-admin/companies/{organizationId}/limits/history */
export async function getOrganizationLimitsHistory(organizationId: number) {
  const { data } = await axiosInstance.get<ApiResponse<LimitHistoryRow[]>>(
    `/v1/super-admin/companies/${organizationId}/limits/history`,
  );
  return data;
}
