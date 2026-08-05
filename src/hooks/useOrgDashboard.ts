"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  SuperAdminDashboardSummaryResponse,
  SuperAdminRecentActivityItem,
} from "@/dtos/res/dashboard.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  getDashboardRecentActivity,
  getDashboardSummary,
} from "@/services/dashboard.service";

export const ORG_DASHBOARD_SUMMARY_KEY = ["org-dashboard", "summary"] as const;
export const ORG_DASHBOARD_ACTIVITY_KEY = ["org-dashboard", "activity"] as const;

async function fetchSummary(): Promise<SuperAdminDashboardSummaryResponse> {
  const response = await getDashboardSummary();
  assertApiSuccess(response, "Failed to load dashboard summary.");
  const summary = unwrapDataModel<SuperAdminDashboardSummaryResponse>(response);
  if (!summary) {
    throw new Error("Dashboard summary was not returned.");
  }
  return summary;
}

async function fetchActivity(
  limit: number,
): Promise<SuperAdminRecentActivityItem[]> {
  const response = await getDashboardRecentActivity(limit);
  assertApiSuccess(response, "Failed to load recent activity.");
  const model = response.dataModel;
  if (Array.isArray(model)) {
    return model as SuperAdminRecentActivityItem[];
  }
  return unwrapList<SuperAdminRecentActivityItem>(response);
}

export function useOrgDashboard(limit = 20) {
  const summaryQuery = useQuery({
    queryKey: ORG_DASHBOARD_SUMMARY_KEY,
    queryFn: fetchSummary,
  });

  const activityQuery = useQuery({
    queryKey: [...ORG_DASHBOARD_ACTIVITY_KEY, limit],
    queryFn: () => fetchActivity(limit),
  });

  return {
    summary: summaryQuery.data,
    activity: activityQuery.data ?? [],
    isLoading: summaryQuery.isLoading || activityQuery.isLoading,
    isError: summaryQuery.isError || activityQuery.isError,
    error: summaryQuery.error ?? activityQuery.error,
    refetch: async () => {
      await Promise.all([summaryQuery.refetch(), activityQuery.refetch()]);
    },
  };
}
