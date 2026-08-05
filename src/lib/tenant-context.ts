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

export function setTenantContext(context: TenantContextState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TENANT_CONTEXT_KEY, JSON.stringify(context));
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

export function clearTenantContext(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TENANT_CONTEXT_KEY);
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
