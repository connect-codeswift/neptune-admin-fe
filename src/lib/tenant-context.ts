export type CachedTenantSite = {
  id: string;
  numericId: number;
  name: string;
  location: string;
  industryType: string;
  siteSize: string;
  userCount: number;
};

export type TenantContextState = {
  organizationId: number;
  organizationName: string;
  siteId: number;
  siteName: string;
  sites: CachedTenantSite[];
};

const TENANT_CONTEXT_KEY = "neptune_tenant_context";

/** Fired in the same tab after setTenantContext — StorageEvent only crosses tabs. */
export const TENANT_CONTEXT_CHANGED_EVENT = "neptune-tenant-context-changed";

export function setTenantContext(context: TenantContextState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TENANT_CONTEXT_KEY, JSON.stringify(context));
  window.dispatchEvent(new Event(TENANT_CONTEXT_CHANGED_EVENT));
}

export function getTenantContext(): TenantContextState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TENANT_CONTEXT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TenantContextState;
  } catch {
    return null;
  }
}

/** True when the stored org token + tenant cache match this company id. */
export function tenantContextMatchesOrg(organizationId: number): boolean {
  if (typeof window === "undefined") return false;
  const context = getTenantContext();
  return context?.organizationId === organizationId;
}

export function clearTenantContext(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TENANT_CONTEXT_KEY);
  window.dispatchEvent(new Event(TENANT_CONTEXT_CHANGED_EVENT));
}

export function getCachedSitesForOrg(orgId: string | number): CachedTenantSite[] {
  const context = getTenantContext();
  if (!context || String(context.organizationId) !== String(orgId)) {
    return [];
  }
  return context.sites;
}

export function getDefaultCachedSiteId(orgId: string | number): string | null {
  const sites = getCachedSitesForOrg(orgId);
  if (sites.length === 0) return null;

  const context = getTenantContext();
  if (context && String(context.organizationId) === String(orgId)) {
    const match = sites.find((site) => site.numericId === context.siteId);
    if (match) return match.id;
  }

  return sites[0]?.id ?? null;
}

/** Keep cached tenant site labels in sync after metadata edits. */
export function patchCachedSiteInTenantContext(
  siteId: number,
  patch: Partial<
    Pick<CachedTenantSite, "name" | "location" | "industryType" | "siteSize">
  >,
): void {
  const context = getTenantContext();
  if (!context) return;

  const sites = context.sites.map((site) =>
    site.numericId === siteId
      ? {
          ...site,
          name: patch.name ?? site.name,
          location: patch.location ?? site.location,
          industryType: patch.industryType ?? site.industryType,
          siteSize: patch.siteSize ?? site.siteSize,
        }
      : site,
  );

  setTenantContext({
    ...context,
    sites,
    siteName:
      context.siteId === siteId && patch.name ? patch.name : context.siteName,
  });
}
