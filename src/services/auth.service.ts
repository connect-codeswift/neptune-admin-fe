import type { RegisterPayload } from "@/dtos/req/onboarding.req";
import type { RegisterResponse } from "@/dtos/res/onboarding.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

export {
  clearAuthTokens,
  clearMfaToken,
  getAuthRole,
  getAuthToken,
  getMfaToken,
  getOrgToken,
  isAdminRole,
  isSuperAdminRole,
  setAuthRole,
  setAuthToken,
  setMfaToken,
  setOrgToken,
  type StoredAuthRole,
} from "@/lib/auth-tokens";

export * from "./org-auth.service";
export * from "./super-admin-auth.service";

/** POST /v1/auth/register */
export async function register(payload: RegisterPayload) {
  const { data } = await axiosInstance.post<ApiResponse<RegisterResponse>>(
    "/v1/auth/register",
    payload,
  );
  return data;
}
