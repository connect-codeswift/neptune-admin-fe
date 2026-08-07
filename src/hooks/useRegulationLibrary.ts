"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComplianceCreatePayload } from "@/dtos/req/compliance.req";
import type { ComplianceResponse } from "@/dtos/res/compliance.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import type { DummyRegulation } from "@/lib/dummy-regulations";
import {
  mapComplianceResponsesToRegulations,
  mapComplianceToRegulation,
  mapRegulationFormToCreatePayload,
} from "@/lib/mappers/compliance.mapper";
import { useTenantScope, type TenantScope } from "@/hooks/useTenantScope";
import {
  addCompliance,
  getAllCompliances,
  getComplianceDashboardKpis,
} from "@/services/compliance.service";

/**
 * Prefixes. Compliance rows are stored per site and every read filters on the SiteId
 * inside the org token, so the same URL returns a different library per site. Creating
 * one invalidates the prefix, which covers every site's entry.
 */
export const REGULATION_LIBRARY_QUERY_KEY = ["compliance", "regulations"] as const;
export const REGULATION_KPIS_QUERY_KEY = ["compliance", "dashboard-kpis"] as const;

export function regulationLibraryQueryKey(scope: TenantScope, search?: string) {
  return [...REGULATION_LIBRARY_QUERY_KEY, ...scope.key, search ?? ""] as const;
}

export function regulationKpisQueryKey(scope: TenantScope) {
  return [...REGULATION_KPIS_QUERY_KEY, ...scope.key] as const;
}

async function fetchRegulations(search?: string): Promise<DummyRegulation[]> {
  const response = await getAllCompliances({
    pageNumber: 1,
    pageSize: 100,
    search: search?.trim() || null,
  });
  assertApiSuccess(response, "Failed to load regulations.");
  const records = unwrapList<ComplianceResponse>(response);
  return mapComplianceResponsesToRegulations(records);
}

export function useRegulationLibrary(search?: string) {
  const scope = useTenantScope();

  return useQuery({
    queryKey: regulationLibraryQueryKey(scope, search),
    queryFn: () => fetchRegulations(search),
    enabled: scope.ready,
  });
}

export function useComplianceDashboardKpis() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: regulationKpisQueryKey(scope),
    enabled: scope.ready,
    queryFn: async () => {
      const response = await getComplianceDashboardKpis();
      assertApiSuccess(response, "Failed to load compliance KPIs.");
      return unwrapDataModel<Record<string, unknown>>(response) ?? {};
    },
  });
}

export function useCreateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ComplianceCreatePayload) => {
      const response = await addCompliance(payload);
      assertApiSuccess(response, "Failed to save regulation.");
      const created = unwrapDataModel<ComplianceResponse>(response);
      return created ? mapComplianceToRegulation(created) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGULATION_LIBRARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REGULATION_KPIS_QUERY_KEY });
    },
  });
}
