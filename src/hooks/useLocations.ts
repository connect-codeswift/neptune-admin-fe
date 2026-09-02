"use client";

import { useQuery } from "@tanstack/react-query";
import type { LocationResponse } from "@/dtos/res/locations.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import { getLocations } from "@/services/locations.service";

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
