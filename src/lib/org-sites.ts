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
