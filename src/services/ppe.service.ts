import type { CreatePpePayload, GetPpeListPayload } from "@/dtos/req/ppe.req";
import type {
  PpeKpiInventoryResponse,
  PpeKpiResponse,
  PpeResponse,
} from "@/dtos/res/ppe.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** POST /v1/ppe/issues */
export async function issuePpe(payload: Record<string, unknown>) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/ppe/issues",
    payload,
  );
  return data;
}

/** GET /v1/ppe/issues/{id} */
export async function getPpeIssueById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/v1/ppe/issues/${id}`,
  );
  return data;
}

/** GET /v1/ppe/issues/assigned-to-me */
export async function getPpeIssuesAssignedTo(params?: Record<string, unknown>) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/ppe/issues/assigned-to-me",
    { params },
  );
  return data;
}

/** GET /v1/ppe/issues/count-by-status */
export async function getPpeIssueCountByStatus(params?: Record<string, unknown>) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/ppe/issues/count-by-status",
    { params },
  );
  return data;
}

/**
 * GET /v1/ppe/issues?status=
 *
 * The dedicated `by-status` path collapsed into a `status` query parameter on the
 * issues collection.
 */
export async function getPpeIssuesByStatus(params?: Record<string, unknown>) {
  const { data } = await axiosInstance.get<ApiResponse>("/v1/ppe/issues", {
    params,
  });
  return data;
}

/** POST /v1/ppe/items — the bare `/ppe` collection meant "PPE items". */
export async function createPpe(payload: CreatePpePayload) {
  const { data } = await axiosInstance.post<ApiResponse<PpeResponse>>(
    "/v1/ppe/items",
    payload,
  );
  return data;
}

/** GET /v1/ppe/items */
export async function getPpeList(params?: GetPpeListPayload) {
  const { data } = await axiosInstance.get<
    ApiResponse<PpeResponse[] | { items?: PpeResponse[] }>
  >("/v1/ppe/items", { params });
  return data;
}

/** GET /v1/ppe/items/{id} */
export async function getPpeById(id: string | number) {
  const { data } = await axiosInstance.get<ApiResponse<PpeResponse>>(
    `/v1/ppe/items/${id}`,
  );
  return data;
}

/** POST /v1/ppe/inspection-checklists */
export async function createInspectionChecklist(payload: Record<string, unknown>) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/ppe/inspection-checklists",
    payload,
  );
  return data;
}

/** GET /v1/ppe/items/{ppeId}/inspection-checklist */
export async function getInspectionChecklist(ppeId: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/v1/ppe/items/${ppeId}/inspection-checklist`,
  );
  return data;
}

/** POST /v1/ppe/inspection-status */
export async function updateInspectionStatus(payload: Record<string, unknown>) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/ppe/inspection-status",
    payload,
  );
  return data;
}

/** GET /v1/ppe/kpis */
export async function getPpeKpi() {
  const { data } = await axiosInstance.get<ApiResponse<PpeKpiResponse>>(
    "/v1/ppe/kpis",
  );
  return data;
}

/** GET /v1/ppe/kpis/inventory */
export async function getPpeKpiInventory() {
  const { data } = await axiosInstance.get<ApiResponse<PpeKpiInventoryResponse>>(
    "/v1/ppe/kpis/inventory",
  );
  return data;
}

/**
 * POST /v1/ppe/issues/{issueId}/acknowledge
 *
 * `issueId` used to be a query parameter on a flat `/ppe/acknowledge`; it is now the
 * path segment, so it is required. `org` / `siteId` stay query parameters.
 */
export async function acknowledgePpe(
  issueId: number,
  params?: {
    org?: string;
    siteId?: number;
  },
) {
  const { data } = await axiosInstance.post<ApiResponse>(
    `/v1/ppe/issues/${issueId}/acknowledge`,
    null,
    { params },
  );
  return data;
}
