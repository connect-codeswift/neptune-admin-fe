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

/**
 * A distinct branch, not `kpiTargetsQueryKey(scope)` with a siteId tacked on:
 * the tenant-scoped key belongs to the logged-in user's own-site page. Fetching
 * another site's targets under that same key would overwrite that cache entry
 * and the user would silently see the wrong targets on their own KPI page.
 */
export const KPI_TARGETS_BY_SITE_KEY = [...KPI_TARGETS_KEY, "by-site"] as const;

export function kpiTargetsBySiteQueryKey(siteId: number) {
  return [...KPI_TARGETS_BY_SITE_KEY, siteId] as const;
}

async function fetchKpiTargets() {
  const response = await getKpiTargets();
  assertApiSuccess(response, "Failed to load KPI targets.");
  return unwrapList<KpiTargetResponse>(response);
}

async function fetchKpiTargetsBySite(siteId: number) {
  const response = await getKpiTargets(undefined, siteId);
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

/** KPI targets for an arbitrary site, e.g. the site details page's tab. */
export function useKpiTargetsBySite(siteId: number) {
  return useQuery({
    queryKey: kpiTargetsBySiteQueryKey(siteId),
    queryFn: () => fetchKpiTargetsBySite(siteId),
    enabled: Number.isFinite(siteId) && siteId > 0,
  });
}

export function useSaveKpiTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveKpiTargetPayload) => {
      const response = await saveKpiTarget(payload);
      assertApiSuccess(response, "Failed to save the target.");
      return response;
    },
    onSuccess: async () => {
      // KPI_TARGETS_KEY, not kpiTargetsQueryKey(scope): invalidation is
      // prefix-based, and the tenant-scoped key does not prefix-match the
      // "by-site" branch. Using the root refreshes both, so a target edited
      // here is not stale on that site's details tab.
      await queryClient.invalidateQueries({ queryKey: KPI_TARGETS_KEY });
    },
  });
}

export function useDropKpiTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await dropKpiTarget(id);
      assertApiSuccess(response, "Failed to clear the target.");
      return response;
    },
    onSuccess: async () => {
      // KPI_TARGETS_KEY, not kpiTargetsQueryKey(scope): invalidation is
      // prefix-based, and the tenant-scoped key does not prefix-match the
      // "by-site" branch. Using the root refreshes both, so a target edited
      // here is not stale on that site's details tab.
      await queryClient.invalidateQueries({ queryKey: KPI_TARGETS_KEY });
    },
  });
}
