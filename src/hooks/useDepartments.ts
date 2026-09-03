"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/dtos/req/departments.req";
import type { DepartmentResponse } from "@/dtos/res/departments.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  updateDepartment,
} from "@/services/docs.service";

/**
 * Departments are per-site — the same URL returns a different list per `siteId`. Keyed on
 * the siteId so two sites viewed back to back (e.g. from the site details page) do not
 * share a cache entry.
 */
export const DEPARTMENTS_BY_SITE_KEY = ["departments", "by-site"] as const;

export function departmentsBySiteQueryKey(siteId: number) {
  return [...DEPARTMENTS_BY_SITE_KEY, siteId] as const;
}

async function fetchDepartmentsBySite(siteId: number) {
  const response = await getAllDepartments({ siteId });
  assertApiSuccess(response, "Failed to load departments.");
  return unwrapList<DepartmentResponse>(response);
}

/** Departments for an arbitrary site, e.g. the site details page's tab. */
export function useDepartmentsBySite(siteId: number) {
  return useQuery({
    queryKey: departmentsBySiteQueryKey(siteId),
    queryFn: () => fetchDepartmentsBySite(siteId),
    enabled: Number.isFinite(siteId) && siteId > 0,
  });
}

/**
 * Writes take the site from the caller's token only — there is no `siteId` to pass, and none
 * of these mutations accept one. Callers are responsible for only exposing them when the
 * page being viewed is the caller's own site (see `DepartmentsPage`).
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddDepartmentPayload) => {
      const response = await createDepartment(payload);
      assertApiSuccess(response, "Failed to create department.");
      return response;
    },
    onSuccess: () => {
      // DEPARTMENTS_BY_SITE_KEY is the root: invalidation is prefix-based, so this
      // refreshes every site's cached list, not just the token's own.
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_BY_SITE_KEY });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: number; payload: UpdateDepartmentPayload }) => {
      const response = await updateDepartment(input.id, input.payload);
      assertApiSuccess(response, "Failed to rename department.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_BY_SITE_KEY });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteDepartment(id);
      assertApiSuccess(response, "Failed to drop department.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_BY_SITE_KEY });
    },
  });
}
