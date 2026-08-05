import type { LoginPayload, OrgEnableMfaPayload, VerifyMfaPayload } from "@/dtos/req/auth.req";
import type {
  LoginResponse,
  MfaEnableResponse,
  MfaSetupResponse,
  VerifyMfaResponse,
} from "@/dtos/res/auth.res";
import { getOrgDashboardPath } from "@/lib/auth-redirect";
import { clearAuthTokens, clearMfaToken, isSuperAdminRole } from "@/lib/auth-tokens";
import {
  orgLogin,
  orgMfaEnable,
  orgMfaSetup,
  orgVerifyMfa,
} from "@/services/org-auth.service";
import {
  superAdminLogin,
  superAdminMfaEnable,
  superAdminMfaSetup,
  superAdminVerifyMfa,
} from "@/services/super-admin-auth.service";

export type AuthFlowKind = "org" | "super";

export type AuthFlowConfig = {
  loginPath: string;
  mfaPath: string;
  mfaSetupPath: string;
  forgotPasswordPath: string;
  resetPasswordPath: string;
  resolveDashboardPath: (accessToken: string) => string;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  verifyMfa: (payload: VerifyMfaPayload) => Promise<VerifyMfaResponse>;
  mfaSetup: (mfaToken: string) => Promise<MfaSetupResponse>;
  mfaEnable: (mfaToken: string, code: string) => Promise<MfaEnableResponse>;
};

export const AUTH_FLOWS: Record<AuthFlowKind, AuthFlowConfig> = {
  org: {
    loginPath: "/login",
    mfaPath: "/login/mfa",
    mfaSetupPath: "/login/mfa-setup",
    forgotPasswordPath: "/forgot-password",
    resetPasswordPath: "/reset-password",
    resolveDashboardPath: getOrgDashboardPath,
    login: orgLogin,
    verifyMfa: orgVerifyMfa,
    mfaSetup: orgMfaSetup,
    mfaEnable: orgMfaEnable,
  },
  super: {
    loginPath: "/super/login",
    mfaPath: "/super/login/mfa",
    mfaSetupPath: "/super/login/mfa-setup",
    forgotPasswordPath: "/super/forgot-password",
    resetPasswordPath: "/super/reset-password",
    resolveDashboardPath: () => "/super/dashboard",
    login: superAdminLogin,
    verifyMfa: superAdminVerifyMfa,
    mfaSetup: (mfaToken) => superAdminMfaSetup({ mfaToken }),
    mfaEnable: (mfaToken, code) => superAdminMfaEnable({ mfaToken, code }),
  },
};

export function getAuthFlow(kind: AuthFlowKind): AuthFlowConfig {
  return AUTH_FLOWS[kind];
}

/** Login path after sign-out; read role before clearing tokens. */
export function getLogoutLoginPath(): string {
  return isSuperAdminRole()
    ? AUTH_FLOWS.super.loginPath
    : AUTH_FLOWS.org.loginPath;
}

export function logoutSession() {
  clearMfaToken();
  clearAuthTokens();
}

export {
  clearMfaToken,
  getMfaToken,
  setMfaToken,
} from "@/lib/auth-tokens";
