import {
  getAuthRole,
  getAuthToken,
  getOrgToken,
  isSuperAdminRole,
} from "@/lib/auth-tokens";

export type DashboardKind = "super" | "org";

export function canAccessSuperDashboard(): boolean {
  return Boolean(getAuthToken()) && isSuperAdminRole();
}

export function canAccessOrgDashboard(): boolean {
  if (isSuperAdminRole()) {
    return Boolean(getAuthToken());
  }
  return Boolean(getOrgToken());
}

export function getDashboardLoginRedirect(kind: DashboardKind): string {
  if (kind === "super") {
    return "/super/login";
  }

  if (isSuperAdminRole()) {
    return "/super/login";
  }

  return "/login";
}

export function canAccessDashboard(kind: DashboardKind): boolean {
  return kind === "super"
    ? canAccessSuperDashboard()
    : canAccessOrgDashboard();
}

/** Redirect target when access check fails for the given dashboard kind. */
export function getFailedAccessRedirect(kind: DashboardKind): string {
  if (kind === "super") {
    return "/super/login";
  }

  const role = getAuthRole();
  if (role === "super-admin") {
    return "/super/login";
  }

  return "/login";
}
