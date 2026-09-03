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

/**
 * A distinct branch, not `docCategoriesQueryKey(scope)` with a siteId tacked
 * on: the tenant-scoped key belongs to the logged-in user's own-site page.
 * Fetching another site's categories under that same key would overwrite
 * that cache entry and the user would silently see the wrong categories on
 * their own Document Categories page.
 */
export const DOC_CATEGORIES_BY_SITE_KEY = [...DOC_CATEGORIES_KEY, "by-site"] as const;

export function docCategoriesBySiteQueryKey(siteId: number) {
  return [...DOC_CATEGORIES_BY_SITE_KEY, siteId] as const;
}

async function fetchCategories() {
  const response = await getAllCategories();
  assertApiSuccess(response, "Failed to load document categories.");
  return unwrapList<DocCategoryResponse>(response);
}

async function fetchCategoriesBySite(siteId: number) {
  const response = await getAllCategories({ siteId });
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

/** Document categories for an arbitrary site, e.g. the site details page's tab. */
export function useDocCategoriesBySite(siteId: number) {
  return useQuery({
    queryKey: docCategoriesBySiteQueryKey(siteId),
    queryFn: () => fetchCategoriesBySite(siteId),
    enabled: Number.isFinite(siteId) && siteId > 0,
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
      // DOC_CATEGORIES_KEY, not docCategoriesQueryKey(scope): invalidation is
      // prefix-based, and the tenant-scoped key does not prefix-match the
      // "by-site" branch. Using the root refreshes both, so a category added
      // here is not stale on that site's details tab.
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
      // DOC_CATEGORIES_KEY, not docCategoriesQueryKey(scope): see the
      // create-mutation comment above.
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
      // DOC_CATEGORIES_KEY, not docCategoriesQueryKey(scope): see the
      // create-mutation comment above.
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
