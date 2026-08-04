import axios from "axios";
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
  const token = orgToken || authToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

    return Promise.reject(
      new Error(status ? message : `Request failed: ${message}`),
    );
  },
);

export default axiosInstance;
