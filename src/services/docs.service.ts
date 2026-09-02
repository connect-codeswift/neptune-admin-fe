import type {
  AddDocCategoryPayload,
  UpdateDocCategoryPayload,
} from "@/dtos/res/doc-categories.res";
import type { DepartmentResponse } from "@/dtos/res/departments.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiPayload, ApiResponse } from "@/types/api.types";

/** POST /v1/documents */
export async function createDocument(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/documents",
    payload,
  );
  return data;
}

/** PUT /v1/documents/{id} — the id used to travel in the body; it is now a path segment. */
export async function updateDocument(id: string | number, payload: ApiPayload) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/v1/documents/${id}`,
    payload,
  );
  return data;
}

/** POST /v1/documents/{documentId}/versions */
export async function createDocumentVersion(
  documentId: string | number,
  payload: ApiPayload,
) {
  const { data } = await axiosInstance.post<ApiResponse>(
    `/v1/documents/${documentId}/versions`,
    payload,
  );
  return data;
}

/**
 * POST /v1/document-versions/{versionId}/acknowledge
 *
 * Was `PUT /Document/Acknowledgement`. Both the verb and the shape changed: acknowledging is
 * a transition on one version, not an update of an "Acknowledgement" resource.
 */
export async function updateAcknowledgement(
  versionId: string | number,
  payload?: ApiPayload,
) {
  const { data } = await axiosInstance.post<ApiResponse>(
    `/v1/document-versions/${versionId}/acknowledge`,
    payload ?? {},
  );
  return data;
}

/** POST /v1/documents/{id}/approval — was `PUT /Document/DocApproval`. */
export async function updateDocApproval(
  id: string | number,
  payload?: ApiPayload,
) {
  const { data } = await axiosInstance.post<ApiResponse>(
    `/v1/documents/${id}/approval`,
    payload ?? {},
  );
  return data;
}

/** POST /v1/documents/search — body-filtered read. */
export async function getAllDocuments(payload?: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/documents/search",
    payload ?? {},
  );
  return data;
}

/** POST /v1/departments — departments left DocumentController; they are org-level. */
export async function addDepartment(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/departments",
    payload,
  );
  return data;
}

/**
 * GET /v1/departments — not paginated, name-ordered. Omit `siteId` for the token's site,
 * unchanged. An explicit `siteId` is honoured only for a live site the caller is a member
 * of — anything else 404s with "Site not found for this company."
 */
export async function getAllDepartments(params?: {
  siteId?: number;
  search?: string;
}) {
  const { data } = await axiosInstance.get<ApiResponse<DepartmentResponse[]>>(
    "/v1/departments",
    params && Object.keys(params).length > 0 ? { params } : undefined,
  );
  return data;
}

/** POST /v1/document-categories */
export async function addCategory(payload: AddDocCategoryPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/document-categories",
    payload,
  );
  return data;
}

/** PUT /v1/document-categories/{id} */
export async function updateCategory(
  id: string | number,
  payload: UpdateDocCategoryPayload,
) {
  const { data } = await axiosInstance.put<ApiResponse>(
    `/v1/document-categories/${id}`,
    payload,
  );
  return data;
}

/** DELETE /v1/document-categories/{id} */
export async function deleteCategory(id: string | number) {
  const { data } = await axiosInstance.delete<ApiResponse>(
    `/v1/document-categories/${id}`,
  );
  return data;
}

/** GET /v1/document-categories */
export async function getAllCategories() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/document-categories",
  );
  return data;
}

/** GET /v1/documents/dashboard-kpis */
export async function getDocumentDashboardKpis() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/documents/dashboard-kpis",
  );
  return data;
}

/** GET /v1/documents/category-stats */
export async function getCategoryStats() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/documents/category-stats",
  );
  return data;
}

/** GET /v1/document-versions/{documentVersionId}/acknowledgements */
export async function getVersionAcknowledgements(
  documentVersionId: string | number,
) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/v1/document-versions/${documentVersionId}/acknowledgements`,
  );
  return data;
}

/** GET /v1/documents/{documentId}/versions */
export async function getDocumentVersions(documentId: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/v1/documents/${documentId}/versions`,
  );
  return data;
}

/** GET /v1/documents/{id} */
export async function getDocumentById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(`/v1/documents/${id}`);
  return data;
}
