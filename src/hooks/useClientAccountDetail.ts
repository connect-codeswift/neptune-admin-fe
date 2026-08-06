"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateCompanyProfilePayload } from "@/dtos/req/companies.req";
import type { SuperAdminCompanyDetailResponse } from "@/dtos/res/companies.res";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  getCompanyById,
  getCompanySites,
  updateCompany,
  updateCompanyModules,
} from "@/services/companies.service";
import { SUPER_ADMIN_COMPANIES_KEY } from "./useSuperAdminCompanies";

export function clientAccountDetailQueryKey(organizationId: number | string) {
  return ["super-admin", "companies", organizationId, "detail"] as const;
}

export function companySitesQueryKey(
  organizationId: number | string,
  includeDeleted = false,
) {
  return [
    "super-admin",
    "companies",
    organizationId,
    "sites",
    includeDeleted,
  ] as const;
}

async function fetchCompanyDetail(
  organizationId: number,
): Promise<SuperAdminCompanyDetailResponse> {
  const response = await getCompanyById(organizationId);
  assertApiSuccess(response, "Failed to load company profile.");
  const detail = unwrapDataModel<SuperAdminCompanyDetailResponse>(response);
  if (!detail) {
    throw new Error("Company profile was not returned.");
  }
  return detail;
}

export function useClientAccountDetail(organizationId?: number) {
  return useQuery({
    queryKey: clientAccountDetailQueryKey(organizationId ?? "none"),
    queryFn: () => fetchCompanyDetail(organizationId!),
    enabled: typeof organizationId === "number" && organizationId > 0,
  });
}

async function fetchCompanySites(
  organizationId: number,
  includeDeleted: boolean,
) {
  const response = await getCompanySites(organizationId, { includeDeleted });
  assertApiSuccess(response, "Failed to load sites.");
  const model = response.dataModel;
  if (Array.isArray(model)) {
    return model;
  }
  return unwrapList<SuperAdminSiteRow>(response);
}

export function useCompanySites(
  organizationId?: number,
  includeDeleted = false,
) {
  return useQuery({
    queryKey: companySitesQueryKey(organizationId ?? "none", includeDeleted),
    queryFn: () => fetchCompanySites(organizationId!, includeDeleted),
    enabled: typeof organizationId === "number" && organizationId > 0,
  });
}

export function useUpdateCompanyProfile(organizationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCompanyProfilePayload) => {
      const response = await updateCompany(organizationId, payload);
      assertApiSuccess(response, "Failed to update company profile.");
      return unwrapDataModel<SuperAdminCompanyDetailResponse>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clientAccountDetailQueryKey(organizationId),
      });
      void queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_COMPANIES_KEY });
    },
  });
}

export function useUpdateCompanyModules(organizationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activatedModules: string) => {
      const response = await updateCompanyModules(organizationId, {
        activatedModules,
      });
      assertApiSuccess(response, "Failed to update modules.");
      return unwrapDataModel<SuperAdminCompanyDetailResponse>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clientAccountDetailQueryKey(organizationId),
      });
      void queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_COMPANIES_KEY });
    },
  });
}
