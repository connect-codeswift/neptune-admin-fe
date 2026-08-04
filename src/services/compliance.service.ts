import type {
  ComplianceCreatePayload,
  ComplianceGridFilterPayload,
  ComplianceUpdatePayload,
} from "@/dtos/req/compliance.req";
import type {
  ComplianceDashboardKpisResponse,
  ComplianceResponse,
} from "@/dtos/res/compliance.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** POST /Compliance/AddCompliance */
export async function addCompliance(payload: ComplianceCreatePayload) {
  const { data } = await axiosInstance.post<ApiResponse<ComplianceResponse>>(
    "/Compliance/AddCompliance",
    payload,
  );
  return data;
}

/** GET /Compliance/{id} */
export async function getComplianceById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse<ComplianceResponse>>(
    `/Compliance/${id}`,
  );
  return data;
}

/** POST /Compliance/GetAllCompliances */
export async function getAllCompliances(payload: ComplianceGridFilterPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<ComplianceResponse[] | { items?: ComplianceResponse[] }>
  >("/Compliance/GetAllCompliances", payload);
  return data;
}

/** PUT /Compliance/Update */
export async function updateCompliance(payload: ComplianceUpdatePayload) {
  const { data } = await axiosInstance.put<ApiResponse<ComplianceResponse>>(
    "/Compliance/Update",
    payload,
  );
  return data;
}

/** DELETE /Compliance/{id} */
export async function deleteCompliance(id: string | number) {
  const { data } = await axiosInstance.delete<ApiResponse>(
    `/Compliance/${id}`,
  );
  return data;
}

/** GET /Compliance/dashboard-kpis */
export async function getComplianceDashboardKpis() {
  const { data } = await axiosInstance.get<
    ApiResponse<ComplianceDashboardKpisResponse>
  >("/Compliance/dashboard-kpis");
  return data;
}

/** GET /Compliance/category-stats */
export async function getComplianceCategoryStats() {
  const { data } = await axiosInstance.get<ApiResponse>("/Compliance/category-stats");
  return data;
}

/** GET /Compliance/upcoming-filings */
export async function getComplianceUpcomingFilings() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/Compliance/upcoming-filings",
  );
  return data;
}
