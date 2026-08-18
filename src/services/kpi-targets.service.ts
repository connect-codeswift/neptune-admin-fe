import type {
  KpiTargetModule,
  SaveKpiTargetPayload,
} from "@/dtos/req/kpi-targets.req";
import type {
  KpiTargetResponse,
  SaveKpiTargetResponse,
} from "@/dtos/res/kpi-targets.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/**
 * KPI targets — the only write API for the numbers EHSS dashboards compare against.
 *
 * Default axios auth (`orgToken || authToken`) is correct here. Do NOT add `/v1/kpi-targets`
 * to `STAFF_ONLY_AUTH_PATHS`: the staff token resolves no tenant database, so the request
 * would fail before it reached a site.
 */

/** GET /v1/kpi-targets — omit `module` to get every module for the site on the token. */
export async function getKpiTargets(module?: KpiTargetModule) {
  const { data } = await axiosInstance.get<ApiResponse<KpiTargetResponse[]>>(
    "/v1/kpi-targets",
    module ? { params: { module } } : undefined,
  );
  return data;
}

/** PUT /v1/kpi-targets — create or overwrite one metric. */
export async function saveKpiTarget(payload: SaveKpiTargetPayload) {
  const { data } = await axiosInstance.put<ApiResponse<SaveKpiTargetResponse>>(
    "/v1/kpi-targets",
    payload,
  );
  return data;
}

/**
 * DELETE /v1/kpi-targets/{id} — soft-delete, so the tile reports *no target* rather than
 * zero. Setting the same (module, metric) later revives this row.
 */
export async function dropKpiTarget(id: number) {
  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    `/v1/kpi-targets/${String(id)}`,
  );
  return data;
}
