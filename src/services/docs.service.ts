import axiosInstance from "@/lib/axiosInstance";
import type { ApiPayload, ApiResponse } from "@/types/api.types";

/** POST /Document/document */
export async function createDocument(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/Document/document",
    payload,
  );
  return data;
}

/** PUT /Document/document */
export async function updateDocument(payload: ApiPayload) {
  const { data } = await axiosInstance.put<ApiResponse>(
    "/Document/document",
    payload,
  );
  return data;
}

/** POST /Document/document_version */
export async function createDocumentVersion(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/Document/document_version",
    payload,
  );
  return data;
}

/** PUT /Document/Acknowledgement */
export async function updateAcknowledgement(payload: ApiPayload) {
  const { data } = await axiosInstance.put<ApiResponse>(
    "/Document/Acknowledgement",
    payload,
  );
  return data;
}

/** PUT /Document/DocApproval */
export async function updateDocApproval(payload: ApiPayload) {
  const { data } = await axiosInstance.put<ApiResponse>(
    "/Document/DocApproval",
    payload,
  );
  return data;
}

/** POST /Document/allDocuments */
export async function getAllDocuments(payload?: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/Document/allDocuments",
    payload ?? {},
  );
  return data;
}

/** POST /Document/AddDepartment */
export async function addDepartment(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/Document/AddDepartment",
    payload,
  );
  return data;
}

/** GET /Document/GetAllDepartments */
export async function getAllDepartments() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/Document/GetAllDepartments",
  );
  return data;
}

/** POST /Document/AddCategory */
export async function addCategory(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/Document/AddCategory",
    payload,
  );
  return data;
}

/** GET /Document/GetAllCategories */
export async function getAllCategories() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/Document/GetAllCategories",
  );
  return data;
}

/** GET /Document/dashboard-kpis */
export async function getDocumentDashboardKpis() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/Document/dashboard-kpis",
  );
  return data;
}

/** GET /Document/category-stats */
export async function getCategoryStats() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/Document/category-stats",
  );
  return data;
}

/** GET /Document/versions/{documentVersionId}/acknowledgements */
export async function getVersionAcknowledgements(
  documentVersionId: string | number,
) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/Document/versions/${documentVersionId}/acknowledgements`,
  );
  return data;
}

/** GET /Document/{documentId}/versions */
export async function getDocumentVersions(documentId: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/Document/${documentId}/versions`,
  );
  return data;
}

/** GET /Document/{id} */
export async function getDocumentById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(`/Document/${id}`);
  return data;
}
