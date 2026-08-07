"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddDocCategoryPayload,
  DocCategoryResponse,
  DocCategoryStatsResponse,
  DocDashboardKpisResponse,
  UpdateDocCategoryPayload,
} from "@/dtos/res/doc-categories.res";
import { useTenantScope, type TenantScope } from "@/hooks/useTenantScope";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryStats,
  getDocumentDashboardKpis,
  updateCategory,
} from "@/services/docs.service";

/**
 * Prefixes. Categories are stored per site (`DocCategory.SiteId`) and every read is
 * filtered by the SiteId inside the org token, so the same URL returns a different list
 * per site. Mutations invalidate on the prefix, which covers every site's entry.
 */
export const DOC_CATEGORIES_KEY = ["document", "categories"] as const;
export const DOC_CATEGORY_STATS_KEY = ["document", "category-stats"] as const;
export const DOC_DASHBOARD_KPIS_KEY = ["document", "dashboard-kpis"] as const;

export function docCategoriesQueryKey(scope: TenantScope) {
  return [...DOC_CATEGORIES_KEY, ...scope.key] as const;
}

export function docCategoryStatsQueryKey(scope: TenantScope) {
  return [...DOC_CATEGORY_STATS_KEY, ...scope.key] as const;
}

export function docDashboardKpisQueryKey(scope: TenantScope) {
  return [...DOC_DASHBOARD_KPIS_KEY, ...scope.key] as const;
}

async function fetchCategories() {
  const response = await getAllCategories();
  assertApiSuccess(response, "Failed to load document categories.");
  return unwrapList<DocCategoryResponse>(response);
}

async function fetchCategoryStats() {
  const response = await getCategoryStats();
  assertApiSuccess(response, "Failed to load category stats.");
  return (
    unwrapDataModel<DocCategoryStatsResponse>(response) ?? {
      totalCategories: 0,
      requiredCategories: 0,
      categoriesWithDocuments: 0,
      totalDocuments: 0,
    }
  );
}

async function fetchDashboardKpis() {
  const response = await getDocumentDashboardKpis();
  assertApiSuccess(response, "Failed to load document KPIs.");
  return (
    unwrapDataModel<DocDashboardKpisResponse>(response) ?? {
      totalDocuments: 0,
      pendingApproval: 0,
      expiringSoon: 0,
      overdueReview: 0,
    }
  );
}

export function useDocCategories() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: docCategoriesQueryKey(scope),
    queryFn: fetchCategories,
    enabled: scope.ready,
  });
}

export function useDocCategoryStats() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: docCategoryStatsQueryKey(scope),
    queryFn: fetchCategoryStats,
    enabled: scope.ready,
  });
}

export function useDocDashboardKpis() {
  const scope = useTenantScope();

  return useQuery({
    queryKey: docDashboardKpisQueryKey(scope),
    queryFn: fetchDashboardKpis,
    enabled: scope.ready,
  });
}

export function useCreateDocCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddDocCategoryPayload) => {
      const response = await addCategory(payload);
      assertApiSuccess(response, "Failed to create category.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOC_CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: DOC_CATEGORY_STATS_KEY });
      queryClient.invalidateQueries({ queryKey: DOC_DASHBOARD_KPIS_KEY });
    },
  });
}

export function useUpdateDocCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: number;
      payload: UpdateDocCategoryPayload;
    }) => {
      const response = await updateCategory(input.id, input.payload);
      assertApiSuccess(response, "Failed to update category.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOC_CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: DOC_CATEGORY_STATS_KEY });
    },
  });
}

export function useDeleteDocCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteCategory(id);
      assertApiSuccess(response, "Failed to delete category.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOC_CATEGORIES_KEY });
      queryClient.invalidateQueries({ queryKey: DOC_CATEGORY_STATS_KEY });
    },
  });
}

export type DocCategoryViewModel = {
  id: string;
  name: string;
  description: string;
  color: string;
  slug: string;
  required: boolean;
  requiresApproval: boolean;
  retentionDays: number | null;
  documentCount: number;
  deletable: boolean;
};

export function mapDocCategory(category: DocCategoryResponse): DocCategoryViewModel {
  return {
    id: String(category.id),
    name: category.categorytName,
    description: category.description?.trim() ?? "",
    color: category.color?.trim() || "#7c3aed",
    slug: category.slug?.trim() || "—",
    required: category.isRequired === true,
    requiresApproval: category.requiresApprovalWorkflow === true,
    retentionDays: category.retentionDays ?? null,
    documentCount: category.documentCount ?? 0,
    deletable: (category.documentCount ?? 0) === 0,
  };
}
