import type {
  LoginPayload,
  SuperAdminBootstrapPayload,
  SuperAdminCreatePayload,
  SuperAdminForgotPasswordPayload,
  SuperAdminMfaSetupPayload,
  SuperAdminResetPasswordPayload,
  SuperAdminSelectCompanyPayload,
  VerifyMfaPayload,
} from "@/dtos/req/auth.req";
import type {
  LoginResponse,
  MfaEnableResponse,
  MfaSetupResponse,
  SelectCompanyResponse,
  SuperAdminBootstrapResponse,
  SuperAdminForgotPasswordResponse,
  SuperAdminResetPasswordResponse,
  VerifyMfaResponse,
} from "@/dtos/res/auth.res";
import {
  setAuthEmail,
  setAuthRole,
  setAuthToken,
  setOrgToken,
} from "@/lib/auth-tokens";
import { extractAccessToken } from "@/lib/auth-response";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/** POST /v1/super-admin/auth/login */
export async function superAdminLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/v1/super-admin/auth/login",
    payload,
  );
  // Login never returns a session token, only an MFA challenge, and the session
  // token that follows carries no identity claims. Remember the email now so the
  // shell can show who is signed in.
  setAuthEmail(payload.email);
  return data;
}

/** POST /v1/super-admin/auth/verify-mfa */
export async function superAdminVerifyMfa(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<VerifyMfaResponse>(
    "/v1/super-admin/auth/verify-mfa",
    payload,
  );
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setAuthToken(accessToken);
    setAuthRole("super-admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
}

/** POST /v1/super-admin/auth/mfa/setup */
export async function superAdminMfaSetup(payload: SuperAdminMfaSetupPayload) {
  const { data } = await axiosInstance.post<MfaSetupResponse>(
    "/v1/super-admin/auth/mfa/setup",
    payload,
  );
  return data;
}

/** POST /v1/super-admin/auth/mfa/enable */
export async function superAdminMfaEnable(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<MfaEnableResponse>(
    "/v1/super-admin/auth/mfa/enable",
    payload,
  );
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setAuthToken(accessToken);
    setAuthRole("super-admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
}

export type GetSuperAdminCompaniesParams = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

/** GET /v1/super-admin/companies */
export async function getCompanies(params?: GetSuperAdminCompaniesParams) {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/v1/super-admin/companies",
    { params },
  );
  return data;
}

/** GET /v1/super-admin/companies/{orgId}/sites */
export async function getCompanySites(orgId: string | number) {
  const { data } = await axiosInstance.get<ApiResponse>(
    `/v1/super-admin/companies/${orgId}/sites`,
  );
  return data;
}

/** POST /v1/super-admin/auth/select-company */
export async function selectCompany(payload: SuperAdminSelectCompanyPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<SelectCompanyResponse>
  >("/v1/super-admin/auth/select-company", payload);

  const token = data.dataModel?.accessToken;
  if (token) {
    setOrgToken(token);
  }

  return data;
}

/** POST /v1/super-admin/staff */
export async function createSuperAdmin(payload: SuperAdminCreatePayload) {
  const { data } = await axiosInstance.post<ApiResponse<unknown>>(
    "/v1/super-admin/staff",
    payload,
  );
  return data;
}

/** POST /v1/super-admin/auth/forgot-password */
export async function superAdminForgotPassword(
  payload: SuperAdminForgotPasswordPayload,
) {
  const { data } = await axiosInstance.post<
    ApiResponse<SuperAdminForgotPasswordResponse>
  >("/v1/super-admin/auth/forgot-password", payload);
  return data;
}

/** POST /v1/super-admin/auth/reset-password */
export async function superAdminResetPassword(
  payload: SuperAdminResetPasswordPayload,
) {
  const { data } = await axiosInstance.post<
    ApiResponse<SuperAdminResetPasswordResponse>
  >("/v1/super-admin/auth/reset-password", payload);
  return data;
}

/** POST /v1/super-admin/auth/bootstrap */
export async function superAdminBootstrap(payload: SuperAdminBootstrapPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<SuperAdminBootstrapResponse>
  >("/v1/super-admin/auth/bootstrap", payload);
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
