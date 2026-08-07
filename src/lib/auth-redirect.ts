import { buildOrgSitePath, getDefaultSiteIdForOrg } from "@/lib/org-sites";

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding);
  return atob(padded);
}

export function parseJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    return JSON.parse(decodeBase64Url(segment)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readClaim(
  payload: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

/** Resolve org/site dashboard path from a tenant session token. */
export function getOrgDashboardPath(accessToken: string): string {
  const payload = parseJwtPayload(accessToken);
  if (!payload) {
    return buildOrgSitePath("1", getDefaultSiteIdForOrg("1"));
  }

  const organizationId =
    readClaim(payload, [
      "OrganizationId",
      "organizationId",
      "orgId",
      "organization_id",
      "tenantId",
    ]) ?? "1";
  const siteId =
    readClaim(payload, [
      "SiteId",
      "siteId",
      "site_id",
      "subCompanyId",
    ]) ?? getDefaultSiteIdForOrg(organizationId);

  return buildOrgSitePath(organizationId, siteId);
}
