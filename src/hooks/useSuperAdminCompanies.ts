"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  SuperAdminCompanyResponse,
  SuperAdminSiteResponse,
} from "@/dtos/res/companies.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import {
  getCompanies,
  getCompanySites,
} from "@/services/super-admin-auth.service";

export const SUPER_ADMIN_COMPANIES_KEY = ["super-admin", "companies"] as const;

export function companySitesQueryKey(organizationId: number | string) {
  return ["super-admin", "companies", organizationId, "sites"] as const;
}

async function fetchCompanies(search?: string) {
  const response = await getCompanies({
    pageNumber: 1,
    pageSize: 100,
    search: search || undefined,
  });
  assertApiSuccess(response, "Failed to load companies.");
  return unwrapList<SuperAdminCompanyResponse>(response);
}

async function fetchSites(organizationId: number) {
  const response = await getCompanySites(organizationId);
  assertApiSuccess(response, "Failed to load sites.");
  return unwrapList<SuperAdminSiteResponse>(response);
}

export function useSuperAdminCompanies(search?: string) {
  return useQuery({
    queryKey: [...SUPER_ADMIN_COMPANIES_KEY, search ?? ""],
    queryFn: () => fetchCompanies(search),
  });
}

export function useSuperAdminCompanySites(organizationId?: number) {
  return useQuery({
    queryKey: companySitesQueryKey(organizationId ?? "none"),
    queryFn: () => fetchSites(organizationId!),
    enabled: typeof organizationId === "number" && organizationId > 0,
  });
}
