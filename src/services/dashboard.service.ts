import type {
  SuperAdminDashboardSummaryResponse,
  SuperAdminRecentActivityResponse,
} from "@/dtos/res/dashboard.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** GET /v1/super-admin/dashboard/summary */
export async function getDashboardSummary() {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminDashboardSummaryResponse>
  >("/v1/super-admin/dashboard/summary");
  return data;
}

/** GET /v1/super-admin/dashboard/recent-activity */
export async function getDashboardRecentActivity(limit = 20) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminRecentActivityResponse>
  >("/v1/super-admin/dashboard/recent-activity", { params: { limit } });
  return data;
}
