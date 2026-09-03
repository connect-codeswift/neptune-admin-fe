"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePpePayload } from "@/dtos/req/ppe.req";
import type { PpeResponse } from "@/dtos/res/ppe.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  mapCatalogDraftToCreatePayload,
  mapPpeResponseToCatalogItem,
} from "@/lib/mappers/ppe.mapper";
import { createPpe, getPpeList } from "@/services/ppe.service";

/**
 * Root prefix for every PPE catalog query. Creating an item invalidates it,
 * which covers each site's entry underneath.
 */
export const PPE_CATALOG_QUERY_KEY = ["ppe", "catalog"] as const;

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
