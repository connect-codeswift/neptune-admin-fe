import type {
  SuperAdminCompanyResponse,
  SuperAdminSiteResponse,
} from "@/dtos/res/companies.res";
import { assertApiSuccess, unwrapList } from "@/lib/api-response";
import {
  type CachedTenantSite,
  setTenantContext,
} from "@/lib/tenant-context";
import { buildOrgSitePath } from "@/lib/org-sites";
import {
  getCompanies,
  getCompanySites,
  selectCompany,
} from "@/services/super-admin-auth.service";

function mapSite(site: SuperAdminSiteResponse): CachedTenantSite {
  return {
    id: String(site.id),
    numericId: site.id,
    name: site.siteName,
    location: site.location,
    industryType: site.industryType,
    siteSize: site.siteSize,
    userCount: site.userCount,
  };
}

export async function fetchCompanySites(
  organizationId: number,
): Promise<CachedTenantSite[]> {
  const response = await getCompanySites(organizationId);
  assertApiSuccess(response, "Failed to load sites.");
  return unwrapList<SuperAdminSiteResponse>(response).map(mapSite);
}

export async function fetchCompanies(): Promise<SuperAdminCompanyResponse[]> {
  const response = await getCompanies({
    pageNumber: 1,
    pageSize: 100,
  });
  assertApiSuccess(response, "Failed to load companies.");
  return unwrapList<SuperAdminCompanyResponse>(response);
}

export async function enterOrganization(input: {
  organizationId: number;
  organizationName: string;
  siteId?: number;
}): Promise<{ siteId: number; sites: CachedTenantSite[] }> {
  const sites = await fetchCompanySites(input.organizationId);
  if (sites.length === 0) {
    throw new Error("This organization has no sites yet.");
  }

  const resolvedSite =
    sites.find((site) => site.numericId === input.siteId) ?? sites[0];
  if (!resolvedSite) {
    throw new Error("Could not resolve a site for this organization.");
  }

  const selectResponse = await selectCompany({
    organizationId: input.organizationId,
    siteId: resolvedSite.numericId,
  });
  assertApiSuccess(selectResponse, "Failed to select organization.");

  setTenantContext({
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    siteId: resolvedSite.numericId,
    siteName: resolvedSite.name,
    sites,
  });

  return { siteId: resolvedSite.numericId, sites };
}

export async function switchOrganizationSite(input: {
  organizationId: number;
  organizationName: string;
  siteId: number;
  sites?: CachedTenantSite[];
}): Promise<void> {
  const sites =
    input.sites ?? (await fetchCompanySites(input.organizationId));
  const target = sites.find((site) => site.numericId === input.siteId);
  if (!target) {
    throw new Error("Selected site was not found for this organization.");
  }

  const selectResponse = await selectCompany({
    organizationId: input.organizationId,
    siteId: target.numericId,
  });
  assertApiSuccess(selectResponse, "Failed to switch site.");

  setTenantContext({
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    siteId: target.numericId,
    siteName: target.name,
    sites,
  });
}

export function buildOrgDashboardPath(
  organizationId: number | string,
  siteId: number | string,
): string {
  return buildOrgSitePath(String(organizationId), String(siteId));
}
