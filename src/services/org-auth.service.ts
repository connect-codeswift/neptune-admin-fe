import type { LoginPayload, OrgEnableMfaPayload, VerifyMfaPayload } from "@/dtos/req/auth.req";
import type {
  LoginResponse,
  MfaEnableResponse,
  MfaSetupResponse,
  VerifyMfaResponse,
} from "@/dtos/res/auth.res";
import { setAuthEmail, setAuthRole, setOrgToken } from "@/lib/auth-tokens";
import { extractAccessToken } from "@/lib/auth-response";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

export type OrgMeSite = {
  id: number;
  siteName: string;
  location?: string | null;
  industryType?: string | null;
  siteSize?: string | null;
};

export type OrgMeResponse = {
  id: number;
  name: string;
  sites?: OrgMeSite[] | null;
};

export type SelectSiteResponse = {
  accessToken: string;
  refreshToken?: string | null;
  siteId: number;
  siteName: string;
};

/**
 * POST /Auth/login
 *
 * Unlike the SuperAdmin flow this can return a full session immediately: when
 * the account has MFA disabled the response carries `accessToken` and there is
 * no `mfaToken` at all. Store it here so an MFA-off admin is not stranded.
 *
 * In the admin portal this endpoint is only reached by `Ehs_Director` tenant
 * admins; `Ehs_Lead` is rejected at `/AdminPortalAuth/login` and cannot browse
 * the admin portal.
 */
export async function orgLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>("/Auth/login", payload);
  setAuthEmail(payload.email);
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setOrgToken(accessToken);
    // The stored role "admin" corresponds to the API role `Ehs_Director`.
    // `Ehs_Lead` is rejected by the admin portal login gate.
    setAuthRole("admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
}

/** POST /Auth/verify-mfa */
export async function orgVerifyMfa(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<VerifyMfaResponse>(
    "/Auth/verify-mfa",
    payload,
  );
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setOrgToken(accessToken);
    // The stored role "admin" corresponds to the API role `Ehs_Director`.
    // `Ehs_Lead` is rejected by the admin portal login gate.
    setAuthRole("admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
}

/** POST /Auth/mfa/setup — bearer credential is the login mfaToken. */
export async function orgMfaSetup(mfaToken: string) {
  const { data } = await axiosInstance.post<MfaSetupResponse>(
    "/Auth/mfa/setup",
    undefined,
    {
      headers: { Authorization: `Bearer ${mfaToken}` },
    },
  );
  return data;
}

/** POST /Auth/mfa/enable */
export async function orgMfaEnable(mfaToken: string, code: string) {
  const payload: OrgEnableMfaPayload = { code };
  const { data } = await axiosInstance.post<MfaEnableResponse>(
    "/Auth/mfa/enable",
    payload,
    {
      headers: { Authorization: `Bearer ${mfaToken}` },
    },
  );
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setOrgToken(accessToken);
    // The stored role "admin" corresponds to the API role `Ehs_Director`.
    // `Ehs_Lead` is rejected by the admin portal login gate.
    setAuthRole("admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
}

/** GET /Auth/Org/me — org context + the sites this tenant admin may switch to. */
export async function getOrgMe() {
  const { data } = await axiosInstance.get<ApiResponse<OrgMeResponse>>(
    "/Auth/Org/me",
  );
  return data;
}

/**
 * POST /Auth/select-site — reissues the org token with a new SiteId. Same contract
 * the EHSS app uses; required for multi-site tenant Admins in this portal.
 * Only `Ehs_Director` tenant admins reach this path in the admin portal.
 */
export async function selectOrgSite(siteId: number) {
  const { data } = await axiosInstance.post<ApiResponse<SelectSiteResponse>>(
    "/Auth/select-site",
    { siteId },
  );

  const accessToken =
    extractAccessToken(data) ?? data.dataModel?.accessToken ?? undefined;
  if (accessToken) {
    setOrgToken(accessToken);
    // The stored role "admin" corresponds to the API role `Ehs_Director`.
    // `Ehs_Lead` is rejected by the admin portal login gate.
    setAuthRole("admin");
  }

  return data;
}
