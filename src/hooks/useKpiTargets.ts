"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SaveKpiTargetPayload } from "@/dtos/req/kpi-targets.req";
import type { KpiTargetResponse } from "@/dtos/res/kpi-targets.res";
import { useTenantScope, type TenantScope } from "@/hooks/useTenantScope";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import {
  dropKpiTarget,
  getKpiTargets,
  saveKpiTarget,
} from "@/services/kpi-targets.service";

/**
 * Targets are stored per `SiteId`, taken from the org token — the same URL returns a
 * different list per site. The key therefore carries the tenant scope, so switching
 * sites in `HeaderSiteChanger` refetches instead of showing the previous site's rows.
 */
export const KPI_TARGETS_KEY = ["kpi-targets"] as const;

export function kpiTargetsQueryKey(scope: TenantScope) {
  return [...KPI_TARGETS_KEY, ...scope.key] as const;
}

async function fetchKpiTargets() {
  const response = await getKpiTargets();
  assertApiSuccess(response, "Failed to load KPI targets.");
  return unwrapList<KpiTargetResponse>(response);
}

export function useKpiTargets() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: kpiTargetsQueryKey(scope),
    queryFn: fetchKpiTargets,
    enabled: scope.ready,
  });
}

export function useSaveKpiTarget() {
  const queryClient = useQueryClient();
  const scope = useTenantScope();

  return useMutation({
    mutationFn: async (payload: SaveKpiTargetPayload) => {
      const response = await saveKpiTarget(payload);
      assertApiSuccess(response, "Failed to save the target.");
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: kpiTargetsQueryKey(scope),
      });
    },
  });
}

export function useDropKpiTarget() {
  const queryClient = useQueryClient();
  const scope = useTenantScope();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await dropKpiTarget(id);
      assertApiSuccess(response, "Failed to clear the target.");
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: kpiTargetsQueryKey(scope),
      });
    },
  });
}
