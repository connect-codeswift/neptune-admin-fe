const AUTH_TOKEN_KEY = "neptune_admin_auth_token";
const ORG_TOKEN_KEY = "neptune_admin_org_token";
const MFA_TOKEN_KEY = "neptune_admin_mfa_token";
const AUTH_ROLE_KEY = "neptune_admin_role";
const AUTH_EMAIL_KEY = "neptune_admin_email";

// Local-storage role names differ from the API role names:
// - "admin"       corresponds to the API role `Ehs_Director` (tenant admin).
// - "super-admin" corresponds to CodeSwift staff.
//
// `Ehs_Lead` is a site authority and is rejected by the backend at
// `/v1/admin/auth/login`; it is never stored here as "admin".
export type StoredAuthRole = "super-admin" | "admin";

export const AUTH_SESSION_EVENT = "neptune:auth-session-updated";

function notifyAuthSessionUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  notifyAuthSessionUpdated();
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setOrgToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(ORG_TOKEN_KEY, token);
  notifyAuthSessionUpdated();
}

export function getOrgToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ORG_TOKEN_KEY);
}

import { clearTenantContext } from "@/lib/tenant-context";

export function clearOrgToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ORG_TOKEN_KEY);
}

/** Clears org-scoped session only; staff auth token is preserved. */
export function clearOrgSession() {
  clearOrgToken();
  clearTenantContext();
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(ORG_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_ROLE_KEY);
  window.localStorage.removeItem(AUTH_EMAIL_KEY);
  clearTenantContext();
}

/** Clears session storage and redirects to the given login path. */
export function forceLogoutRedirect(loginPath: string) {
  if (typeof window === "undefined") return;
  clearMfaToken();
  clearAuthTokens();
  if (!window.location.pathname.startsWith(loginPath)) {
    window.location.assign(loginPath);
  }
}

export function setAuthRole(role: StoredAuthRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_ROLE_KEY, role);
  notifyAuthSessionUpdated();
}

export function getAuthRole(): StoredAuthRole | null {
  if (typeof window === "undefined") return null;
  const role = window.localStorage.getItem(AUTH_ROLE_KEY);
  if (role === "super-admin" || role === "admin") return role;
  return null;
}

/**
 * The signed-in email, remembered at login purely so the shell can identify the
 * current user. A SuperAdmin session token carries only `id` and `purpose`, and
 * no endpoint returns the account, so this is the only source available.
 */
export function setAuthEmail(email: string) {
  if (typeof window === "undefined" || !email) return;
  window.localStorage.setItem(AUTH_EMAIL_KEY, email);
}

export function getAuthEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_EMAIL_KEY);
}

export function isSuperAdminRole(): boolean {
  return getAuthRole() === "super-admin";
}

// Returns true when the stored role is "admin", i.e. the current session is a
// tenant `Ehs_Director` admin (not CodeSwift staff, not `Ehs_Lead`).
// Note: this checks localStorage only; for access decisions also verify the
// org token does not carry the `Ehs_Lead` role (see dashboard-auth.ts).
export function isAdminRole(): boolean {
  return getAuthRole() === "admin";
}

export function setMfaToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MFA_TOKEN_KEY, token);
}

export function getMfaToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(MFA_TOKEN_KEY);
}

export function clearMfaToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MFA_TOKEN_KEY);
  window.sessionStorage.removeItem("neptune_admin_portal_account_type");
}

export function getStoredBearerToken(): string | null {
  return getOrgToken() || getAuthToken();
}

export {
  AUTH_TOKEN_KEY,
  ORG_TOKEN_KEY,
  MFA_TOKEN_KEY,
  AUTH_ROLE_KEY,
  AUTH_EMAIL_KEY,
};
