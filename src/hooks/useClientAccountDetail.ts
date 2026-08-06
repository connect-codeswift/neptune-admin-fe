"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SetAccessWindowPayload, UpdateCompanyProfilePayload } from "@/dtos/req/companies.req";
import type {
  AccessHistoryRow,
  AccessWindowResponse,
  SuperAdminCompanyDetailResponse,
} from "@/dtos/res/companies.res";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  clearCompanyAccessWindow,
  getCompanyAccessHistory,
  getCompanyById,
  getCompanySites,
  setCompanyAccessWindow,
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

export function companyAccessHistoryQueryKey(organizationId: number | string) {
  return ["super-admin", "companies", organizationId, "access-history"] as const;
}

function invalidateCompanyAccessQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: number,
) {
  void queryClient.invalidateQueries({
    queryKey: clientAccountDetailQueryKey(organizationId),
  });
  void queryClient.invalidateQueries({
    queryKey: companyAccessHistoryQueryKey(organizationId),
  });
  void queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_COMPANIES_KEY });
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

async function fetchCompanyAccessHistory(
  organizationId: number,
): Promise<AccessHistoryRow[]> {
  const response = await getCompanyAccessHistory(organizationId);
  assertApiSuccess(response, "Failed to load access history.");
  const model = response.dataModel;
  if (Array.isArray(model)) {
    return model;
  }
  return unwrapList<AccessHistoryRow>(response);
}

export function useCompanyAccessHistory(
  organizationId?: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: companyAccessHistoryQueryKey(organizationId ?? "none"),
    queryFn: () => fetchCompanyAccessHistory(organizationId!),
    enabled:
      (options?.enabled ?? true) &&
      typeof organizationId === "number" &&
      organizationId > 0,
  });
}

export function useSetAccessWindow(organizationId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SetAccessWindowPayload) => {
      if (organizationId == null || organizationId <= 0) {
        throw new Error("Organization id is required.");
      }
      const response = await setCompanyAccessWindow(organizationId, payload);
      assertApiSuccess(response, "Failed to set access window.");
      return unwrapDataModel<AccessWindowResponse>(response);
    },
    onSuccess: () => {
      if (organizationId != null && organizationId > 0) {
        invalidateCompanyAccessQueries(queryClient, organizationId);
      }
    },
  });
}

export function useSetAccessWindowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      ...payload
    }: SetAccessWindowPayload & { organizationId: number }) => {
      const response = await setCompanyAccessWindow(organizationId, payload);
      assertApiSuccess(response, "Failed to set access window.");
      return organizationId;
    },
    onSuccess: (organizationId) => {
      invalidateCompanyAccessQueries(queryClient, organizationId);
    },
  });
}

export function useClearAccessWindow(organizationId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (organizationId == null || organizationId <= 0) {
        throw new Error("Organization id is required.");
      }
      const response = await clearCompanyAccessWindow(organizationId);
      assertApiSuccess(response, "Failed to clear access window.");
    },
    onSuccess: () => {
      if (organizationId != null && organizationId > 0) {
        invalidateCompanyAccessQueries(queryClient, organizationId);
      }
    },
  });
}
