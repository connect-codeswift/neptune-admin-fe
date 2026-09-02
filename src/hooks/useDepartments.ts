"use client";

import { useQuery } from "@tanstack/react-query";
import type { DepartmentResponse } from "@/dtos/res/departments.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import { getAllDepartments } from "@/services/docs.service";

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
