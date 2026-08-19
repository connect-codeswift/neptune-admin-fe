import type {
  SuperAdminCompanyResponse,
  SuperAdminSiteResponse,
} from "@/dtos/res/companies.res";
import { assertApiSuccess, unwrapDataModel, unwrapList } from "@/lib/api-response";
import { parseJwtPayload } from "@/lib/auth-redirect";
import { getOrgToken, isAdminRole } from "@/lib/auth-tokens";
import {
  type CachedTenantSite,
  getTenantContext,
  setTenantContext,
} from "@/lib/tenant-context";
import { buildOrgSitePath } from "@/lib/org-sites";
import {
  getOrgMe,
  selectOrgSite,
  type OrgMeSite,
} from "@/services/org-auth.service";
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

function mapOrgMeSite(site: OrgMeSite): CachedTenantSite {
  return {
    id: String(site.id),
    numericId: site.id,
    name: site.siteName,
    location: site.location ?? "",
    industryType: site.industryType ?? "",
    siteSize: site.siteSize ?? "",
    userCount: 0,
  };
}

function readJwtNumber(
  payload: Record<string, unknown> | null,
  keys: string[],
): number | null {
  if (!payload) return null;
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

/**
 * Loads Org/me into the tenant cache for a signed-in tenant `Ehs_Director`
 * admin so the header site switcher has the sites they may switch to (not every
 * company site). `Ehs_Lead` is rejected by the admin portal login gate and
 * never reaches this path.
 */
export async function ensureTenantAdminContext(): Promise<void> {
  if (!isAdminRole() || !getOrgToken()) return;

  const response = await getOrgMe();
  assertApiSuccess(response, "Failed to load organization context.");
  const org = unwrapDataModel<{
    id: number;
    name: string;
    sites?: OrgMeSite[] | null;
  }>(response);
  if (!org) {
    throw new Error("Organization context was empty.");
  }

  const sites = (org.sites ?? []).map(mapOrgMeSite);
  const tokenSiteId = readJwtNumber(parseJwtPayload(getOrgToken() ?? ""), [
    "SiteId",
    "siteId",
  ]);
  const active =
    sites.find((site) => site.numericId === tokenSiteId) ?? sites[0];

  setTenantContext({
    organizationId: org.id,
    organizationName: org.name,
    siteId: active?.numericId ?? tokenSiteId ?? 0,
    siteName: active?.name ?? "Site",
    sites,
  });
}

/** SuperAdmin path: mint a new org token via select-company. */
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

/**
 * Tenant `Ehs_Director` admin path: POST /v1/auth/select-site, replace the org
 * token, update cache. Falls back to refreshing Org/me for the site list when
 * the cache is empty. `Ehs_Lead` is rejected by the admin portal login gate.
 */
export async function switchTenantAdminSite(siteId: number): Promise<void> {
  const response = await selectOrgSite(siteId);
  assertApiSuccess(response, "Failed to switch site.");

  const switched = unwrapDataModel<{
    siteId: number;
    siteName: string;
  }>(response);

  let existing = getTenantContext();
  if (!existing?.sites?.length) {
    await ensureTenantAdminContext();
    existing = getTenantContext();
  }

  const sites = existing?.sites ?? [];
  const target =
    sites.find((site) => site.numericId === siteId) ??
    (switched
      ? {
          id: String(switched.siteId),
          numericId: switched.siteId,
          name: switched.siteName,
          location: "",
          industryType: "",
          siteSize: "",
          userCount: 0,
        }
      : undefined);

  if (!target) {
    throw new Error("Selected site was not found for this account.");
  }

  const organizationId =
    existing?.organizationId ??
    readJwtNumber(parseJwtPayload(getOrgToken() ?? ""), [
      "OrganizationId",
      "organizationId",
    ]) ??
    0;
  const organizationName = existing?.organizationName ?? "Organization";
  const nextSites = sites.some((site) => site.numericId === target.numericId)
    ? sites
    : [...sites, target];

  setTenantContext({
    organizationId,
    organizationName,
    siteId: target.numericId,
    siteName: switched?.siteName ?? target.name,
    sites: nextSites,
  });
}

export function buildOrgDashboardPath(
  organizationId: number | string,
  siteId: number | string,
): string {
  return buildOrgSitePath(String(organizationId), String(siteId));
}
