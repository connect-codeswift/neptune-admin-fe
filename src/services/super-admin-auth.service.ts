import type {
  LoginPayload,
  SuperAdminCreatePayload,
  SuperAdminMfaSetupPayload,
  SuperAdminSelectCompanyPayload,
  VerifyMfaPayload,
} from "@/dtos/req/auth.req";
import type {
  LoginResponse,
  MfaEnableResponse,
  MfaSetupResponse,
  SelectCompanyResponse,
  VerifyMfaResponse,
} from "@/dtos/res/auth.res";
import { setAuthRole, setAuthToken, setOrgToken } from "@/lib/auth-tokens";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** POST /SuperAdminAuth/login */
export async function superAdminLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/SuperAdminAuth/login",
    payload,
  );
  return data;
}

/** POST /SuperAdminAuth/verify-mfa */
export async function superAdminVerifyMfa(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<VerifyMfaResponse>(
    "/SuperAdminAuth/verify-mfa",
    payload,
  );
  if (data.accessToken) {
    setAuthToken(data.accessToken);
    setAuthRole("super-admin");
  }
  return data;
}

/** POST /SuperAdminAuth/mfa/setup */
export async function superAdminMfaSetup(payload: SuperAdminMfaSetupPayload) {
  const { data } = await axiosInstance.post<MfaSetupResponse>(
    "/SuperAdminAuth/mfa/setup",
    payload,
  );
  return data;
}

/** POST /SuperAdminAuth/mfa/enable */
export async function superAdminMfaEnable(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<MfaEnableResponse>(
    "/SuperAdminAuth/mfa/enable",
    payload,
  );
  if (data.accessToken) {
    setAuthToken(data.accessToken);
    setAuthRole("super-admin");
  }
  return data;
}

export type GetSuperAdminCompaniesParams = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** GET /SuperAdminCompanies */
export async function getCompanies(params?: GetSuperAdminCompaniesParams) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/SuperAdminCompanies",
    { params },
  );
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

/** POST /SuperAdminAuth/create */
export async function createSuperAdmin(payload: SuperAdminCreatePayload) {
  const { data } = await axiosInstance.post<ApiResponse<unknown>>(
    "/SuperAdminAuth/create",
    payload,
  );
  return data;
}

/** @deprecated Use superAdminLogin */
export const login = superAdminLogin;

/** @deprecated Use superAdminVerifyMfa */
export const verifyMfa = superAdminVerifyMfa;

/** @deprecated Use superAdminMfaSetup */
export const mfaSetup = superAdminMfaSetup;

/** @deprecated Use superAdminMfaEnable */
export const mfaEnable = superAdminMfaEnable;
