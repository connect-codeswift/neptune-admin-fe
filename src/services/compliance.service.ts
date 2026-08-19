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

/** POST /v1/compliance-records */
export async function addCompliance(payload: ComplianceCreatePayload) {
  const { data } = await axiosInstance.post<ApiResponse<ComplianceResponse>>(
    "/v1/compliance-records",
    payload,
  );
  return data;
}

/** GET /v1/compliance-records/{id} */
export async function getComplianceById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse<ComplianceResponse>>(
    `/v1/compliance-records/${id}`,
  );
  return data;
}

/** POST /v1/compliance-records/search — body-filtered read. */
export async function getAllCompliances(payload: ComplianceGridFilterPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<ComplianceResponse[] | { items?: ComplianceResponse[] }>
  >("/v1/compliance-records/search", payload);
  return data;
}

/**
 * PUT /v1/compliance-records/{id}
 *
 * The id used to travel in the request body (`PUT /Compliance/Update`); it is now a
 * path segment. The body type is unchanged, so `payload.id` may still be present and
 * is simply redundant.
 */
export async function updateCompliance(
  id: string | number,
  payload: ComplianceUpdatePayload,
) {
  const { data } = await axiosInstance.put<ApiResponse<ComplianceResponse>>(
    `/v1/compliance-records/${id}`,
    payload,
  );
  return data;
}

/** DELETE /v1/compliance-records/{id} */
export async function deleteCompliance(id: string | number) {
  const { data } = await axiosInstance.delete<ApiResponse>(
    `/v1/compliance-records/${id}`,
  );
  return data;
}

/** GET /v1/compliance-records/dashboard-kpis */
export async function getComplianceDashboardKpis() {
  const { data } = await axiosInstance.get<
    ApiResponse<ComplianceDashboardKpisResponse>
  >("/v1/compliance-records/dashboard-kpis");
  return data;
}

/** GET /v1/compliance-records/category-stats */
export async function getComplianceCategoryStats() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/compliance-records/category-stats",
  );
  return data;
}

/** GET /v1/compliance-records/upcoming-filings */
export async function getComplianceUpcomingFilings() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/compliance-records/upcoming-filings",
  );
  return data;
}
