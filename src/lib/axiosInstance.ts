import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const UNAUTHENTICATED_AUTH_PATHS = [
  "/SuperAdminAuth/login",
  "/SuperAdminAuth/verify-mfa",
  "/SuperAdminAuth/mfa/setup",
  "/SuperAdminAuth/mfa/enable",
] as const;

const axiosInstance = axios.create({
  baseURL: apiUrl.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

function isUnauthenticatedAuthPath(url?: string): boolean {
  if (!url) return false;
  return UNAUTHENTICATED_AUTH_PATHS.some((path) => url.includes(path));
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

  if (isUnauthenticatedAuthPath(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  const orgToken = window.localStorage.getItem("neptune_admin_org_token");
  const authToken = window.localStorage.getItem("neptune_admin_auth_token");
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
