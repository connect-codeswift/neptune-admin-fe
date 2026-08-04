import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

const axiosInstance = axios.create({
  baseURL: `${backendUrl.replace(/\/$/, "")}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

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
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Request failed";

    const detail =
      typeof message === "string" ? message : JSON.stringify(message);

    return Promise.reject(
      new Error(
        status
          ? `Request failed (${status}): ${detail}`
          : `Request failed: ${detail}`,
      ),
    );
  },
);

export default axiosInstance;
