import axios from "axios";
import {
  ApiError,
  dispatchOrgTokenReselect,
  isOrgTokenReselectMessage,
} from "@/lib/api-error";
import {
  AUTH_TOKEN_KEY,
  forceLogoutRedirect,
  getMfaToken,
  ORG_TOKEN_KEY,
} from "@/lib/auth-tokens";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const BODY_CREDENTIAL_AUTH_PATHS = [
  "/v1/auth/login",
  "/v1/auth/verify-mfa",
  "/v1/admin/auth/login",
  "/v1/super-admin/auth/login",
  "/v1/super-admin/auth/verify-mfa",
  "/v1/super-admin/auth/mfa/setup",
  "/v1/super-admin/auth/mfa/enable",
  "/v1/super-admin/auth/forgot-password",
  "/v1/super-admin/auth/reset-password",
  "/v1/super-admin/auth/bootstrap",
] as const;

const MFA_BEARER_AUTH_PATHS = ["/v1/auth/mfa/setup", "/v1/auth/mfa/enable"] as const;

/** Endpoints that must always use the staff token, even if an org token exists. */
const STAFF_ONLY_AUTH_PATHS = [
  "/v1/super-admin/companies",
  "/v1/super-admin/auth/select-company",
  "/v1/super-admin/staff",
  "/v1/platform-ops",
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

/** Only hard-logout on 401 when the server rejected the session itself. */
function isSessionInvalidMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  if (isOrgTokenReselectMessage(message)) return false;
  return (
    normalized.includes("unauthorized") ||
    normalized.includes("invalid token") ||
    normalized.includes("token expired") ||
    normalized.includes("expired token") ||
    normalized.includes("invalid or expired") ||
    normalized.includes("authentication failed") ||
    normalized.includes("invalid credentials") ||
    normalized.includes("please login")
  );
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
  const useStaffToken =
    config.neptuneUseStaffToken === true || isStaffOnlyAuthPath(config.url);
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
      const requestUrl = error.config?.url ?? "";
      const hadOrgToken = Boolean(window.localStorage.getItem(ORG_TOKEN_KEY));
      const hadAuthToken = Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
      const isCredentialAuthRequest = isBodyCredentialAuthPath(requestUrl);

      if (
        hadOrgToken &&
        (status === 401 || status === 400) &&
        isOrgTokenReselectMessage(message)
      ) {
        window.localStorage.removeItem(ORG_TOKEN_KEY);
        dispatchOrgTokenReselect(message);
      } else if (
        status === 401 &&
        hadOrgToken &&
        !hadAuthToken &&
        !isCredentialAuthRequest &&
        !isOrgTokenReselectMessage(message) &&
        isSessionInvalidMessage(message)
      ) {
        forceLogoutRedirect("/login");
      } else if (
        status === 401 &&
        hadAuthToken &&
        !isCredentialAuthRequest &&
        !isOrgTokenReselectMessage(message) &&
        isSessionInvalidMessage(message)
      ) {
        forceLogoutRedirect("/login");
      }
    }

    return Promise.reject(new ApiError(message, status));
  },
);

export default axiosInstance;
