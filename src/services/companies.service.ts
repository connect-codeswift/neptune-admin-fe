import type {
  UpdateActivatedModulesPayload,
  UpdateCompanyProfilePayload,
} from "@/dtos/req/companies.req";
import type { SuperAdminCompanyDetailResponse } from "@/dtos/res/companies.res";
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
