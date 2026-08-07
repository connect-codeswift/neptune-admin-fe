import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/**
 * Staff-only deploy status endpoints. All three are read-only — the deploy
 * pipeline is driven by merging to `main`, never by this portal.
 *
 * Every environment except production answers 503; see `isDeployPipelineAbsent`
 * in `@/lib/deploy-status`.
 */

/** GET /PlatformOps/deploy-status */
export async function getDeployStatus() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/PlatformOps/deploy-status",
  );
  return data;
}

/** GET /PlatformOps/deploy-history */
export async function getDeployHistory(limit = 50) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/PlatformOps/deploy-history",
    { params: { limit } },
  );
  return data;
}

/** GET /PlatformOps/alerts */
export async function getDeployAlerts(limit = 50) {
  const { data } = await axiosInstance.get<ApiResponse>("/PlatformOps/alerts", {
    params: { limit },
  });
  return data;
}
