import axios from "axios";
import {
  ApiError,
  dispatchOrgTokenReselect,
  isOrgTokenReselectMessage,
} from "@/lib/api-error";
import {
  AUTH_TOKEN_KEY,
  getMfaToken,
  ORG_TOKEN_KEY,
} from "@/lib/auth-tokens";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const BODY_CREDENTIAL_AUTH_PATHS = [
  "/Auth/login",
  "/Auth/verify-mfa",
  "/SuperAdminAuth/login",
  "/SuperAdminAuth/verify-mfa",
  "/SuperAdminAuth/mfa/setup",
  "/SuperAdminAuth/mfa/enable",
] as const;

const MFA_BEARER_AUTH_PATHS = ["/Auth/mfa/setup", "/Auth/mfa/enable"] as const;

/** Endpoints that must always use the staff token, even if an org token exists. */
const STAFF_ONLY_AUTH_PATHS = [
  "/SuperAdminCompanies",
  "/SuperAdminAuth/select-company",
  "/SuperAdminAuth/create",
] as const;

const axiosInstance = axios.create({
  baseURL: apiUrl.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

function isBodyCredentialAuthPath(url?: string): boolean {
  if (!url) return false;
  return BODY_CREDENTIAL_AUTH_PATHS.some((path) => url.includes(path));
}

function isMfaBearerAuthPath(url?: string): boolean {
  if (!url) return false;
  return MFA_BEARER_AUTH_PATHS.some((path) => url.includes(path));
}

function isStaffOnlyAuthPath(url?: string): boolean {
  if (!url) return false;
  return STAFF_ONLY_AUTH_PATHS.some((path) => url.includes(path));
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.title === "string") return record.title;
    if (typeof record.error === "string") return record.error;
  }
  return fallback;
}

axiosInstance.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  if (isBodyCredentialAuthPath(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  if (isMfaBearerAuthPath(config.url)) {
    const mfaToken = getMfaToken();
    if (mfaToken) {
      config.headers.Authorization = `Bearer ${mfaToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  }

  const orgToken = window.localStorage.getItem(ORG_TOKEN_KEY);
  const authToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const useStaffToken = isStaffOnlyAuthPath(config.url);
  const token = useStaffToken ? authToken : orgToken || authToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = extractErrorMessage(
      error.response?.data,
      error.message || "Request failed",
    );

    if (typeof window !== "undefined") {
      const hadOrgToken = Boolean(window.localStorage.getItem(ORG_TOKEN_KEY));
      if (
        hadOrgToken &&
        (status === 401 || status === 400) &&
        isOrgTokenReselectMessage(message)
      ) {
        window.localStorage.removeItem(ORG_TOKEN_KEY);
        dispatchOrgTokenReselect(message);
      }
    }

    return Promise.reject(new ApiError(message, status));
  },
);

export default axiosInstance;
