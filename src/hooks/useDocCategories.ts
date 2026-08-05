"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddDocCategoryPayload,
  DocCategoryResponse,
  DocCategoryStatsResponse,
  DocDashboardKpisResponse,
  UpdateDocCategoryPayload,
} from "@/dtos/res/doc-categories.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryStats,
  getDocumentDashboardKpis,
  updateCategory,
} from "@/services/docs.service";

export const DOC_CATEGORIES_KEY = ["document", "categories"] as const;
export const DOC_CATEGORY_STATS_KEY = ["document", "category-stats"] as const;
export const DOC_DASHBOARD_KPIS_KEY = ["document", "dashboard-kpis"] as const;

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
  return useQuery({
    queryKey: DOC_CATEGORIES_KEY,
    queryFn: fetchCategories,
  });
}

export function useDocCategoryStats() {
  return useQuery({
    queryKey: DOC_CATEGORY_STATS_KEY,
    queryFn: fetchCategoryStats,
  });
}

export function useDocDashboardKpis() {
  return useQuery({
    queryKey: DOC_DASHBOARD_KPIS_KEY,
    queryFn: fetchDashboardKpis,
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
