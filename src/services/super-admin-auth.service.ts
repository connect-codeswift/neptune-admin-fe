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

/** POST /SuperAdminAuth/login */
export async function superAdminLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/SuperAdminAuth/login",
    payload,
  );
  // Login never returns a session token, only an MFA challenge, and the session
  // token that follows carries no identity claims. Remember the email now so the
  // shell can show who is signed in.
  setAuthEmail(payload.email);
  return data;
}

/** POST /SuperAdminAuth/verify-mfa */
export async function superAdminVerifyMfa(payload: VerifyMfaPayload) {
  const { data } = await axiosInstance.post<VerifyMfaResponse>(
    "/SuperAdminAuth/verify-mfa",
    payload,
  );
  const accessToken = extractAccessToken(data);
  if (accessToken) {
    setAuthToken(accessToken);
    setAuthRole("super-admin");
  }
  return { ...data, accessToken: accessToken ?? data.accessToken };
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

/** POST /SuperAdminAuth/forgot-password */
export async function superAdminForgotPassword(
  payload: SuperAdminForgotPasswordPayload,
) {
  const { data } = await axiosInstance.post<
    ApiResponse<SuperAdminForgotPasswordResponse>
  >("/SuperAdminAuth/forgot-password", payload);
  return data;
}

/** POST /SuperAdminAuth/reset-password */
export async function superAdminResetPassword(
  payload: SuperAdminResetPasswordPayload,
) {
  const { data } = await axiosInstance.post<
    ApiResponse<SuperAdminResetPasswordResponse>
  >("/SuperAdminAuth/reset-password", payload);
  return data;
}

/** POST /SuperAdminAuth/bootstrap */
export async function superAdminBootstrap(payload: SuperAdminBootstrapPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<SuperAdminBootstrapResponse>
  >("/SuperAdminAuth/bootstrap", payload);
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
