import axiosInstance from "@/lib/axiosInstance";
import type { ApiPayload, ApiResponse } from "@/types/api.types";

/** POST /ppe/issue */
export async function issuePpe(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>("/ppe/issue", payload);
  return data;
}

/** GET /ppe/issue/{id} */
export async function getPpeIssueById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(`/ppe/issue/${id}`);
  return data;
}

/** GET /ppe/issue/assigned-to */
export async function getPpeIssuesAssignedTo(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/ppe/issue/assigned-to",
    { params },
  );
  return data;
}

/** GET /ppe/issue/count-by-status */
export async function getPpeIssueCountByStatus(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/ppe/issue/count-by-status",
    { params },
  );
  return data;
}

/** GET /ppe/issue/by-status */
export async function getPpeIssuesByStatus(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/ppe/issue/by-status",
    { params },
  );
  return data;
}

/** POST /ppe */
export async function createPpe(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>("/ppe", payload);
  return data;
}

/** GET /ppe */
export async function getPpeList(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>("/ppe", { params });
  return data;
}

/** GET /ppe/{id} */
export async function getPpeById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(`/ppe/${id}`);
  return data;
}

/** POST /ppe/inspection-checklist */
export async function createInspectionChecklist(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/ppe/inspection-checklist",
    payload,
  );
  return data;
}

/** GET /ppe/inspection-checklist/{ppeId} */
export async function getInspectionChecklist(ppeId: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/ppe/inspection-checklist/${ppeId}`,
  );
  return data;
}

/** POST /ppe/inspection-status */
export async function updateInspectionStatus(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/ppe/inspection-status",
    payload,
  );
  return data;
}

/** GET /ppe/kpi */
export async function getPpeKpi(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>("/ppe/kpi", {
    params,
  });
  return data;
}

/** GET /ppe/kpi-inventory */
export async function getPpeKpiInventory(params?: ApiPayload) {
  const { data } = await axiosInstance.get<ApiResponse>("/ppe/kpi-inventory", {
    params,
  });
  return data;
}

/** POST /ppe/acknowledge */
export async function acknowledgePpe(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/ppe/acknowledge",
    payload,
  );
  return data;
}
