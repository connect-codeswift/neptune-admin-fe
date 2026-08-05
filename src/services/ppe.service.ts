import type { CreatePpePayload, GetPpeListPayload } from "@/dtos/req/ppe.req";
import type {
  PpeKpiInventoryResponse,
  PpeKpiResponse,
  PpeResponse,
} from "@/dtos/res/ppe.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** POST /ppe/issue */
export async function issuePpe(payload: Record<string, unknown>) {
  const { data } = await axiosInstance.post<ApiResponse>("/ppe/issue", payload);
  return data;
}

/** GET /ppe/issue/{id} */
export async function getPpeIssueById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(`/ppe/issue/${id}`);
  return data;
}

/** GET /ppe/issue/assigned-to */
export async function getPpeIssuesAssignedTo(params?: Record<string, unknown>) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/ppe/issue/assigned-to",
    { params },
  );
  return data;
}

/** GET /ppe/issue/count-by-status */
export async function getPpeIssueCountByStatus(params?: Record<string, unknown>) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/ppe/issue/count-by-status",
    { params },
  );
  return data;
}

/** GET /ppe/issue/by-status */
export async function getPpeIssuesByStatus(params?: Record<string, unknown>) {
  const { data } = await axiosInstance.get<ApiResponse>("/ppe/issue/by-status", {
    params,
  });
  return data;
}

/** POST /ppe */
export async function createPpe(payload: CreatePpePayload) {
  const { data } = await axiosInstance.post<ApiResponse<PpeResponse>>(
    "/ppe",
    payload,
  );
  return data;
}

/** GET /ppe */
export async function getPpeList(params?: GetPpeListPayload) {
  const { data } = await axiosInstance.get<
    ApiResponse<PpeResponse[] | { items?: PpeResponse[] }>
  >("/ppe", { params });
  return data;
}

/** GET /ppe/{id} */
export async function getPpeById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse<PpeResponse>>(
    `/ppe/${id}`,
  );
  return data;
}

/** POST /ppe/inspection-checklist */
export async function createInspectionChecklist(payload: Record<string, unknown>) {
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
export async function updateInspectionStatus(payload: Record<string, unknown>) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/ppe/inspection-status",
    payload,
  );
  return data;
}

/** GET /ppe/kpi */
export async function getPpeKpi() {
  const { data } = await axiosInstance.get<ApiResponse<PpeKpiResponse>>(
    "/ppe/kpi",
  );
  return data;
}

/** GET /ppe/kpi-inventory */
export async function getPpeKpiInventory() {
  const { data } = await axiosInstance.get<ApiResponse<PpeKpiInventoryResponse>>(
    "/ppe/kpi-inventory",
  );
  return data;
}

/** POST /ppe/acknowledge */
export async function acknowledgePpe(params: {
  issueId?: number;
  org?: string;
  siteId?: number;
}) {
  const { data } = await axiosInstance.post<ApiResponse>("/ppe/acknowledge", null, {
    params,
  });
  return data;
}
