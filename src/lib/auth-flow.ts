import type { LoginPayload } from "@/dtos/req/auth.req";
import type { LoginResponse } from "@/dtos/res/auth.res";
import { clearAuthTokens, clearMfaToken as clearStoredMfaToken } from "@/lib/auth-tokens";
import { clearPortalAccountType } from "@/lib/portal-auth";
import { portalLogin } from "@/services/admin-portal-auth.service";

export const PORTAL_AUTH = {
  loginPath: "/login",
  mfaPath: "/login/mfa",
  mfaSetupPath: "/login/mfa-setup",
  forgotPasswordPath: "/forgot-password",
  resetPasswordPath: "/reset-password",
  login: portalLogin,
} as const;

export type PortalAuthConfig = typeof PORTAL_AUTH & {
  login: (payload: LoginPayload) => Promise<LoginResponse>;
};

/** @deprecated Use PORTAL_AUTH */
export const AUTH_FLOWS = {
  org: PORTAL_AUTH,
  super: PORTAL_AUTH,
} as const;

/** @deprecated Use PortalAuthConfig */
export type AuthFlowKind = "org" | "super";

/** @deprecated Use PORTAL_AUTH */
export function getAuthFlow(): PortalAuthConfig {
  return PORTAL_AUTH;
}

export function getLogoutLoginPath(): string {
  return PORTAL_AUTH.loginPath;
}

export function logoutSession() {
  clearMfaToken();
  clearAuthTokens();
}

export function clearMfaToken() {
  clearStoredMfaToken();
  clearPortalAccountType();
}

export {
  getMfaToken,
  setMfaToken,
} from "@/lib/auth-tokens";
