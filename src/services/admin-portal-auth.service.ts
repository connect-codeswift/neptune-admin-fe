import type { LoginPayload } from "@/dtos/req/auth.req";
import type { LoginResponse } from "@/dtos/res/auth.res";
import { extractAccessToken } from "@/lib/auth-response";
import {
  setAuthEmail,
  setAuthRole,
  setAuthToken,
  setOrgToken,
} from "@/lib/auth-tokens";
import { setPortalAccountType } from "@/lib/portal-auth";
import axiosInstance from "@/lib/axiosInstance";

/**
 * POST /AdminPortalAuth/login
 *
 * Unified admin portal entry: resolves staff (SuperAdmin) vs tenant admin
 * server-side. Staff always continue through SuperAdmin MFA; tenant admins
 * follow the org Auth flow.
 *
 * The backend gate rejects `Ehs_Lead` (site authority) — only `Ehs_Director`
 * tenant admins and CodeSwift staff reach this portal.
 */
export async function portalLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/AdminPortalAuth/login",
    payload,
  );
  setAuthEmail(payload.email);

  if (data.accountType === "staff" || data.accountType === "tenant") {
    setPortalAccountType(data.accountType);
  }

  if (data.accountType === "tenant") {
    const accessToken = extractAccessToken(data);
    if (accessToken) {
      setOrgToken(accessToken);
      // The backend only returns `accountType: "tenant"` for the `Ehs_Director`
      // role; `Ehs_Lead` is rejected at `/AdminPortalAuth/login`. The frontend
      // stores the tenant admin role locally as "admin".
      setAuthRole("admin");
    }
  }

  if (data.accountType === "staff") {
    const accessToken = extractAccessToken(data);
    if (accessToken) {
      setAuthToken(accessToken);
      setAuthRole("super-admin");
    }
  }

  return data;
}
