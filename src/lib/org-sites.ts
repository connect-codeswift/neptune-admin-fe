import {
  getCachedSitesForOrg,
  getDefaultCachedSiteId,
  getTenantContext,
  type CachedTenantSite,
} from "@/lib/tenant-context";

export type OrgSiteOption = {
  id: string;
  name: string;
  type: string;
};

function mapCachedSite(site: CachedTenantSite): OrgSiteOption {
  return {
    id: site.id,
    name: site.name,
    type: site.industryType || site.location || "Site",
  };
}

/** Returns sites cached after select-company for the given org. */
export function getAllSitesOfThisOrg(orgId: string): OrgSiteOption[] {
  return getCachedSitesForOrg(orgId).map(mapCachedSite);
}

export function getDefaultSiteIdForOrg(orgId: string): string {
  return getDefaultCachedSiteId(orgId) ?? "1";
}

/** Org admin dashboard entry path after login or tenant selection. */
export function buildOrgSitePath(orgId: string, siteId: string): string {
  return `/${orgId}/${siteId}/dashboard`;
}

/** Swap the site segment while preserving the rest of the current org route. */
export function replaceSiteInPath(
  pathname: string,
  company: string,
  siteId: string,
): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== company || segments.length < 2) {
    return buildOrgSitePath(company, siteId);
  }
  segments[1] = siteId;
  return `/${segments.join("/")}`;
}

export function getOrganizationName(orgId: string): string | undefined {
  const context = getTenantContext();
  if (!context || String(context.organizationId) !== orgId) return undefined;
  return context.organizationName;
}
