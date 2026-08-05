import type {
  SuperAdminDashboardSummaryResponse,
  SuperAdminRecentActivityResponse,
} from "@/dtos/res/dashboard.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** GET /SuperAdminDashboard/summary */
export async function getDashboardSummary() {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminDashboardSummaryResponse>
  >("/SuperAdminDashboard/summary");
  return data;
}

/** GET /SuperAdminDashboard/recent-activity */
export async function getDashboardRecentActivity(limit = 20) {
  const { data } = await axiosInstance.get<
    ApiResponse<SuperAdminRecentActivityResponse>
  >("/SuperAdminDashboard/recent-activity", { params: { limit } });
  return data;
}
