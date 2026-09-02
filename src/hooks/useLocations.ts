"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LocationPayload } from "@/dtos/req/locations.req";
import type { LocationResponse } from "@/dtos/res/locations.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "@/services/locations.service";

/**
 * Locations are per-site — the same URL returns a different list per `siteId`. Keyed on
 * the siteId so two sites viewed back to back (e.g. from the site details page) do not
 * share a cache entry.
 */
export const LOCATIONS_BY_SITE_KEY = ["locations", "by-site"] as const;

export function locationsBySiteQueryKey(siteId: number) {
  return [...LOCATIONS_BY_SITE_KEY, siteId] as const;
}

async function fetchLocationsBySite(siteId: number) {
  const response = await getLocations({ siteId });
  assertApiSuccess(response, "Failed to load locations.");
  return unwrapList<LocationResponse>(response);
}

/** Locations for an arbitrary site, e.g. the site details page's tab. */
export function useLocationsBySite(siteId: number) {
  return useQuery({
    queryKey: locationsBySiteQueryKey(siteId),
    queryFn: () => fetchLocationsBySite(siteId),
    enabled: Number.isFinite(siteId) && siteId > 0,
  });
}

/**
 * Writes take the site from the token, never from a parameter — see the service JSDoc — so
 * every mutation below only ever affects the caller's own site. Invalidating the root
 * `LOCATIONS_BY_SITE_KEY` (not a single siteId's branch) refreshes whichever site tab is
 * mounted, since invalidation is prefix-based.
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LocationPayload) => {
      const response = await createLocation(payload);
      assertApiSuccess(response, "Failed to create location.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_BY_SITE_KEY });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: number; payload: LocationPayload }) => {
      const response = await updateLocation(input.id, input.payload);
      assertApiSuccess(response, "Failed to rename location.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_BY_SITE_KEY });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteLocation(id);
      assertApiSuccess(response, "Failed to remove location.");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_BY_SITE_KEY });
    },
  });
}
