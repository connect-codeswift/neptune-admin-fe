const AUTH_TOKEN_KEY = "neptune_admin_auth_token";
const ORG_TOKEN_KEY = "neptune_admin_org_token";
const MFA_TOKEN_KEY = "neptune_admin_mfa_token";
const AUTH_ROLE_KEY = "neptune_admin_role";

export type StoredAuthRole = "super-admin" | "admin";

export function setAuthToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setOrgToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(ORG_TOKEN_KEY, token);
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
  clearTenantContext();
}

export function setAuthRole(role: StoredAuthRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_ROLE_KEY, role);
}

export function getAuthRole(): StoredAuthRole | null {
  if (typeof window === "undefined") return null;
  const role = window.localStorage.getItem(AUTH_ROLE_KEY);
  if (role === "super-admin" || role === "admin") return role;
  return null;
}

export function isSuperAdminRole(): boolean {
  return getAuthRole() === "super-admin";
}

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
}

export function getStoredBearerToken(): string | null {
  return getOrgToken() || getAuthToken();
}

export { AUTH_TOKEN_KEY, ORG_TOKEN_KEY, MFA_TOKEN_KEY, AUTH_ROLE_KEY };
