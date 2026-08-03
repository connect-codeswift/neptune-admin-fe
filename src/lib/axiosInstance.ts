import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
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
        status ? `Request failed (${status}): ${detail}` : `Request failed: ${detail}`,
      ),
    );
  },
);

export default axiosInstance;
