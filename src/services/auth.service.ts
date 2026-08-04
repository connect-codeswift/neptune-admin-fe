import axiosInstance from "@/lib/axiosInstance";
import type { ApiPayload, ApiResponse } from "@/types/api.types";

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
export async function login(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/SuperAdminAuth/login",
    payload,
  );
  return data;
}

/** GET /SuperAdminCompanies */
export async function getCompanies() {
  const { data } = await axiosInstance.get<ApiResponse>(
    "/SuperAdminCompanies",
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

/**
 * POST /SuperAdminAuth/select-company
 * Stores returned org token when `token` / `accessToken` / `dataModel` string is present.
 */
export async function selectCompany(payload: ApiPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/SuperAdminAuth/select-company",
    payload,
  );

  const model = data.dataModel;
  if (typeof model === "string" && model.length > 0) {
    setOrgToken(model);
  } else if (model && typeof model === "object") {
    const record = model as Record<string, unknown>;
    const token =
      record.token ?? record.accessToken ?? record.orgToken ?? record.Token;
    if (typeof token === "string" && token.length > 0) {
      setOrgToken(token);
    }
  }

  return data;
}
