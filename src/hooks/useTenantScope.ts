"use client";

import { useParams } from "next/navigation";

export type TenantScope = {
  /** Organization id from the `[company]` route segment. */
  company: string;
  /** Site id from the `[site]` route segment. */
  site: string;
  /** Stable tuple to spread into React Query keys so caches never cross sites. */
  key: readonly [company: string, site: string];
  /** False until both segments resolve — gate queries on this. */
  ready: boolean;
};

function firstSegment(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * Active `[company]/[site]` scope for tenant-scoped screens.
 *
 * Backend scopes every tenant request by the SiteId inside the org token, so
 * two sites return different payloads for the same URL. React Query keys must
 * therefore carry the site, otherwise switching sites in `HeaderSiteChanger`
 * re-renders the same cached rows.
 */
export function useTenantScope(): TenantScope {
  const params = useParams();
  const company = firstSegment(params?.company as string | string[] | undefined);
  const site = firstSegment(params?.site as string | string[] | undefined);

  return {
    company,
    site,
    key: [company, site] as const,
    ready: company !== "" && site !== "",
  };
}
