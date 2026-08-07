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

/** GET /SuperAdminCompanies/{organizationId} */
export async function getCompanyById(organizationId: number) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/SuperAdminCompanies/${organizationId}`);
  return data;
}

export type GetCompanySitesParams = {
  includeDeleted?: boolean;
};

/** GET /SuperAdminCompanies/{organizationId}/sites */
export async function getCompanySites(
  organizationId: number,
  params?: GetCompanySitesParams,
) {
  const { data } = await axiosInstance.get<ApiResponse<SuperAdminSiteRow[]>>(
    `/SuperAdminCompanies/${organizationId}/sites`,
    { params },
  );
  return data;
}

/** PUT /SuperAdminCompanies/{organizationId} */
export async function updateCompany(
  organizationId: number,
  payload: UpdateCompanyProfilePayload,
) {
  const { data } = await axiosInstance.put<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/SuperAdminCompanies/${organizationId}`, payload);
  return data;
}

/** PUT /SuperAdminCompanies/{organizationId}/modules */
export async function updateCompanyModules(
  organizationId: number,
  payload: UpdateActivatedModulesPayload,
) {
  const { data } = await axiosInstance.put<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/SuperAdminCompanies/${organizationId}/modules`, payload);
  return data;
}

/** POST /SuperAdminCompanies/{organizationId}/access */
export async function setCompanyAccessWindow(
  organizationId: number,
  payload: SetAccessWindowPayload,
) {
  const { data } = await axiosInstance.post<ApiResponse<AccessWindowResponse>>(
    `/SuperAdminCompanies/${organizationId}/access`,
    payload,
    { neptuneUseStaffToken: true },
  );
  return data;
}

/** DELETE /SuperAdminCompanies/{organizationId}/access */
export async function clearCompanyAccessWindow(organizationId: number) {
  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    `/SuperAdminCompanies/${organizationId}/access`,
    { neptuneUseStaffToken: true },
  );
  return data;
}

/** GET /SuperAdminCompanies/{organizationId}/access/history */
export async function getCompanyAccessHistory(organizationId: number) {
  const { data } = await axiosInstance.get<ApiResponse<AccessHistoryRow[]>>(
    `/SuperAdminCompanies/${organizationId}/access/history`,
  );
  return data;
}

/** PUT /SuperAdminCompanies/{organizationId}/limits */
export async function setOrganizationLimits(
  organizationId: number,
  payload: SetOrganizationLimitsPayload,
) {
  const { data } = await axiosInstance.put<
    ApiResponse<OrganizationLimitsResponse>
  >(`/SuperAdminCompanies/${organizationId}/limits`, payload, {
    neptuneUseStaffToken: true,
  });
  return data;
}

/** GET /SuperAdminCompanies/{organizationId}/limits/history */
export async function getOrganizationLimitsHistory(organizationId: number) {
  const { data } = await axiosInstance.get<ApiResponse<LimitHistoryRow[]>>(
    `/SuperAdminCompanies/${organizationId}/limits/history`,
  );
  return data;
}
