import {
  getDummyOrganization,
  type DummyOrganizationSite,
} from "@/lib/dummy-organizations";

/** Dummy implementation — replace with API call to getAllSitesOfThisOrg. */
export function getAllSitesOfThisOrg(orgId: string): DummyOrganizationSite[] {
  return getDummyOrganization(orgId)?.sites ?? [];
}

export function getDefaultSiteIdForOrg(orgId: string): string {
  return getAllSitesOfThisOrg(orgId)[0]?.id ?? "1";
}

export function buildOrgSitePath(orgId: string, siteId: string): string {
  return `/${orgId}/${siteId}`;
}
