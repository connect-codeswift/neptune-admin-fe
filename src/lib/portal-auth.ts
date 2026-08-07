import type { VerifyMfaPayload } from "@/dtos/req/auth.req";
import type {
  MfaEnableResponse,
  MfaSetupResponse,
  VerifyMfaResponse,
} from "@/dtos/res/auth.res";
import { getOrgDashboardPath } from "@/lib/auth-redirect";
import {
  orgMfaEnable,
  orgMfaSetup,
  orgVerifyMfa,
} from "@/services/org-auth.service";
import {
  superAdminMfaEnable,
  superAdminMfaSetup,
  superAdminVerifyMfa,
} from "@/services/super-admin-auth.service";

export type PortalAccountType = "staff" | "tenant";

const PORTAL_ACCOUNT_TYPE_KEY = "neptune_admin_portal_account_type";

export type PortalMfaConfig = {
  verifyMfa: (payload: VerifyMfaPayload) => Promise<VerifyMfaResponse>;
  mfaSetup: (mfaToken: string) => Promise<MfaSetupResponse>;
  mfaEnable: (mfaToken: string, code: string) => Promise<MfaEnableResponse>;
  resolveDashboardPath: (accessToken: string) => string;
};

export function setPortalAccountType(accountType: PortalAccountType) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PORTAL_ACCOUNT_TYPE_KEY, accountType);
}

export function getPortalAccountType(): PortalAccountType | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(PORTAL_ACCOUNT_TYPE_KEY);
  if (value === "staff" || value === "tenant") return value;
  return null;
}

export function clearPortalAccountType() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PORTAL_ACCOUNT_TYPE_KEY);
}

export function getPortalMfaConfig(
  accountType: PortalAccountType,
): PortalMfaConfig {
  if (accountType === "staff") {
    return {
      verifyMfa: superAdminVerifyMfa,
      mfaSetup: (mfaToken) => superAdminMfaSetup({ mfaToken }),
      mfaEnable: (mfaToken, code) => superAdminMfaEnable({ mfaToken, code }),
      resolveDashboardPath: () => "/super/dashboard",
    };
  }

  return {
    verifyMfa: orgVerifyMfa,
    mfaSetup: orgMfaSetup,
    mfaEnable: orgMfaEnable,
    resolveDashboardPath: getOrgDashboardPath,
  };
}
