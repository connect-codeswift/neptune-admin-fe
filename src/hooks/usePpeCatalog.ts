"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePpePayload } from "@/dtos/req/ppe.req";
import type { PpeResponse } from "@/dtos/res/ppe.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import type { DummyPpeItem } from "@/lib/dummy-ppe-catalog";
import {
  mapCatalogDraftToCreatePayload,
  mapPpeResponseToCatalogItem,
  mapPpeResponsesToCatalogItems,
} from "@/lib/mappers/ppe.mapper";
import { useTenantScope, type TenantScope } from "@/hooks/useTenantScope";
import { createPpe, getPpeList } from "@/services/ppe.service";

/**
 * Prefix. Catalog rows are stored per site (`PPE.SiteId`) and `GET /ppe` filters on the
 * SiteId inside the org token, so the same URL returns a different catalog per site.
 * Creating an item invalidates the prefix, which covers every site's entry.
 */
export const PPE_CATALOG_QUERY_KEY = ["ppe", "catalog"] as const;

export function ppeCatalogQueryKey(scope: TenantScope) {
  return [...PPE_CATALOG_QUERY_KEY, ...scope.key] as const;
}

async function fetchPpeCatalogItems(): Promise<DummyPpeItem[]> {
  const response = await getPpeList({ pageNumber: 1, pageSize: 100 });
  assertApiSuccess(response, "Failed to load PPE catalog.");
  const records = unwrapList<PpeResponse>(response);
  return mapPpeResponsesToCatalogItems(records);
}

export function usePpeCatalog() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: ppeCatalogQueryKey(scope),
    queryFn: fetchPpeCatalogItems,
    enabled: scope.ready,
  });
}

/**
 * Prefix, distinct from `PPE_CATALOG_QUERY_KEY`. That key is scoped to the
 * caller's own tenant site; reusing it for an explicit `siteId` fetch would
 * overwrite the logged-in user's own-site catalog cache with another site's
 * stock. `by-site` fetches key on the numeric id directly.
 */
export const PPE_CATALOG_BY_SITE_KEY = [...PPE_CATALOG_QUERY_KEY, "by-site"] as const;

export function ppeCatalogBySiteQueryKey(siteId: number) {
  return [...PPE_CATALOG_BY_SITE_KEY, siteId] as const;
}

async function fetchPpeCatalogItemsBySite(siteId: number): Promise<PpeResponse[]> {
  const response = await getPpeList({ siteId, pageNumber: 1, pageSize: 100 });
  assertApiSuccess(response, "Failed to load PPE catalog.");
  return unwrapList<PpeResponse>(response);
}

/** Catalog rows for an arbitrary site, honoured only when it is a live site the caller is a member of. */
export function usePpeCatalogBySite(siteId: number) {
  return useQuery({
    queryKey: ppeCatalogBySiteQueryKey(siteId),
    queryFn: () => fetchPpeCatalogItemsBySite(siteId),
    enabled: Number.isFinite(siteId) && siteId > 0,
  });
}

export function useCreatePpeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePpePayload) => {
      const response = await createPpe(payload);
      assertApiSuccess(response, "Failed to create PPE item.");
      const created = unwrapDataModel<PpeResponse>(response);
      return created ? mapPpeResponseToCatalogItem(created) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PPE_CATALOG_QUERY_KEY });
    },
  });
}

export function buildCreatePpePayloadFromDraft(input: {
  name: string;
  modelNumber: string;
  manufacturer: string;
  safetyStandard: string;
  categoryLabel: string;
  minStockLevel: number;
}): CreatePpePayload {
  return mapCatalogDraftToCreatePayload(input);
}
