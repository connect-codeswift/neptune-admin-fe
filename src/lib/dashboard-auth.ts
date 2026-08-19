import { parseJwtPayload } from "@/lib/auth-redirect";
import {
  getAuthToken,
  getOrgToken,
  isAdminRole,
  isSuperAdminRole,
} from "@/lib/auth-tokens";

export type DashboardKind = "super" | "org";

const LOGIN_PATH = "/login";

/** Role claim keys commonly used in JWTs issued by the backend. */
const ROLE_CLAIM_KEYS = [
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  "role",
  "Role",
];

/** Reads the role claim from the current org token, if any. */
function readOrgTokenRole(): string | null {
  const token = getOrgToken();
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  for (const key of ROLE_CLAIM_KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value) return value;
  }
  return null;
}

export function canAccessSuperDashboard(): boolean {
  return Boolean(getAuthToken()) && isSuperAdminRole();
}

/**
 * Org dashboard access: CodeSwift staff browsing a client org, or a tenant
 * `Ehs_Director` admin of their own org.
 *
 * `Ehs_Lead` is a site authority and is rejected by the backend at
 * `/v1/admin/auth/login`. This function additionally defends against any
 * locally-stored org token that explicitly carries the `Ehs_Lead` role from
 * being treated as an admin portal admin.
 */
export function canAccessOrgDashboard(): boolean {
  if (isSuperAdminRole()) {
    return Boolean(getAuthToken());
  }
  if (!isAdminRole()) return false;

  const role = readOrgTokenRole();
  // Defensive: if the token itself says `Ehs_Lead`, do not grant admin access
  // even if localStorage somehow has the "admin" role marker.
  if (role === "Ehs_Lead") return false;

  return Boolean(getOrgToken());
}

export function getDashboardLoginRedirect(): string {
  return LOGIN_PATH;
}

export function canAccessDashboard(kind: DashboardKind): boolean {
  return kind === "super"
    ? canAccessSuperDashboard()
    : canAccessOrgDashboard();
}

/** Redirect target when access check fails for the given dashboard kind. */
export function getFailedAccessRedirect(): string {
  return LOGIN_PATH;
}
