import type {
  UpdateActivatedModulesPayload,
  UpdateCompanyProfilePayload,
} from "@/dtos/req/companies.req";
import type { SuperAdminCompanyDetailResponse } from "@/dtos/res/companies.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** GET /SuperAdminCompanies/{organizationId} */
export async function getCompanyById(organizationId: number) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminCompanyDetailResponse>
  >(`/SuperAdminCompanies/${organizationId}`);
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
