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

/**
 * POST /Auth/login
 *
 * Unlike the SuperAdmin flow this can return a full session immediately: when
 * the account has MFA disabled the response carries `accessToken` and there is
 * no `mfaToken` at all. Store it here so an MFA-off admin is not stranded.
 */
export async function orgLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>("/Auth/login", payload);
  setAuthEmail(payload.email);
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setOrgToken(accessToken);
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
    setAuthRole("admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
}
