import type {
  SuperAdminLoginPayload,
  SuperAdminMfaSetupPayload,
  SuperAdminSelectCompanyPayload,
  VerifyMfaPayload,
} from "@/dtos/req/auth.req";
import type { RegisterPayload } from "@/dtos/req/onboarding.req";
import type {
  MfaEnableResponse,
  MfaSetupResponse,
  SelectCompanyResponse,
  SuperAdminLoginResponse,
  VerifyMfaResponse,
} from "@/dtos/res/auth.res";
import type { RegisterResponse } from "@/dtos/res/onboarding.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

const AUTH_TOKEN_KEY = "neptune_admin_auth_token";
const ORG_TOKEN_KEY = "neptune_admin_org_token";

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setOrgToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORG_TOKEN_KEY, token);
}

export function getOrgToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ORG_TOKEN_KEY);
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(ORG_TOKEN_KEY);
}

/** POST /SuperAdminAuth/login */
export async function login(payload: SuperAdminLoginPayload) {
  const { data } = await axiosInstance.post<SuperAdminLoginResponse>(
    "/SuperAdminAuth/login",
    payload,
  );
  return data;
}

/** POST /SuperAdminAuth/verify-mfa */
export async function verifyMfa(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<VerifyMfaResponse>(
    "/SuperAdminAuth/verify-mfa",
    payload,
  );
  setAuthToken(data.accessToken);
  return data;
}

/** POST /SuperAdminAuth/mfa/setup */
export async function mfaSetup(payload: SuperAdminMfaSetupPayload) {
  const { data } = await axiosInstance.post<MfaSetupResponse>(
    "/SuperAdminAuth/mfa/setup",
    payload,
  );
  return data;
}

/** POST /SuperAdminAuth/mfa/enable */
export async function mfaEnable(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<MfaEnableResponse>(
    "/SuperAdminAuth/mfa/enable",
    payload,
  );
  setAuthToken(data.accessToken);
  return data;
}

/** POST /Auth/register */
export async function register(payload: RegisterPayload) {
  const { data } = await axiosInstance.post<ApiResponse<RegisterResponse>>(
    "/Auth/register",
    payload,
  );
  return data;
}

/** GET /SuperAdminCompanies */
export async function getCompanies() {
  const { data } = await axiosInstance.get<ApiResponse>("/SuperAdminCompanies");
  return data;
}

/** GET /SuperAdminCompanies/{orgId}/sites */
export async function getCompanySites(orgId: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/SuperAdminCompanies/${orgId}/sites`,
  );
  return data;
}

/** POST /SuperAdminAuth/select-company */
export async function selectCompany(payload: SuperAdminSelectCompanyPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<SelectCompanyResponse>
  >("/SuperAdminAuth/select-company", payload);

  const token = data.dataModel?.accessToken;
  if (token) {
    setOrgToken(token);
  }

  return data;
}
