import {
  getAuthToken,
  getOrgToken,
  isSuperAdminRole,
} from "@/lib/auth-tokens";

export type DashboardKind = "super" | "org";

const LOGIN_PATH = "/login";

export function canAccessSuperDashboard(): boolean {
  return Boolean(getAuthToken()) && isSuperAdminRole();
}

export function canAccessOrgDashboard(): boolean {
  if (isSuperAdminRole()) {
    return Boolean(getAuthToken());
  }
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
