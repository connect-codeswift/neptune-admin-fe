"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSuperAdminSitePayload,
  UpdateSuperAdminSitePayload,
} from "@/dtos/req/companies.req";
import type { SuperAdminSiteRow } from "@/dtos/res/sites.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import {
  clientAccountDetailQueryKey,
} from "@/hooks/useClientAccountDetail";
import {
  createSuperAdminSite,
  deleteSuperAdminSite,
  getSuperAdminSites,
  updateSuperAdminSite,
} from "@/services/sites.service";

export const SUPER_ADMIN_SITES_KEY = ["super-admin", "sites"] as const;

async function fetchSites(includeDeleted: boolean): Promise<SuperAdminSiteRow[]> {
  const response = await getSuperAdminSites({ includeDeleted });
  assertApiSuccess(response, "Failed to load sites.");
  const model = response.dataModel;
  if (Array.isArray(model)) {
    return model as SuperAdminSiteRow[];
  }
  return unwrapList<SuperAdminSiteRow>(response);
}

export function useSuperAdminSites(includeDeleted = false) {
  return useQuery({
    queryKey: [...SUPER_ADMIN_SITES_KEY, includeDeleted],
    queryFn: () => fetchSites(includeDeleted),
  });
}

export function useSuperAdminSiteMutations(organizationId?: number) {
  const queryClient = useQueryClient();
  const staffMutationOptions =
    organizationId != null && organizationId > 0
      ? { organizationId, useStaffToken: true as const }
      : undefined;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_SITES_KEY });
    if (organizationId != null && organizationId > 0) {
      void queryClient.invalidateQueries({
        queryKey: ["super-admin", "companies", organizationId, "sites"],
      });
      void queryClient.invalidateQueries({
        queryKey: clientAccountDetailQueryKey(organizationId),
      });
    }
  };

  const createSite = useMutation({
    mutationFn: async (payload: CreateSuperAdminSitePayload) => {
      const response = await createSuperAdminSite(payload, staffMutationOptions);
      assertApiSuccess(response, "Failed to create site.");
      return unwrapDataModel<SuperAdminSiteRow>(response);
    },
    onSuccess: invalidate,
  });

  const updateSite = useMutation({
    mutationFn: async ({
      siteId,
      payload,
    }: {
      siteId: number;
      payload: UpdateSuperAdminSitePayload;
    }) => {
      const response = await updateSuperAdminSite(
        siteId,
        payload,
        staffMutationOptions,
      );
      assertApiSuccess(response, "Failed to update site.");
      return unwrapDataModel<SuperAdminSiteRow>(response);
    },
    onSuccess: invalidate,
  });

  const removeSite = useMutation({
    mutationFn: async (siteId: number) => {
      const response = await deleteSuperAdminSite(siteId, staffMutationOptions);
      assertApiSuccess(response, "Failed to delete site.");
    },
    onSuccess: invalidate,
  });

  return { createSite, updateSite, removeSite };
}
