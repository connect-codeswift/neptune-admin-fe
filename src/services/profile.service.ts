import axios from "axios";
import type {
  ChangeMyPasswordPayload,
  DisableMyMfaPayload,
  EnableMyMfaPayload,
  UpdateMyAvatarPayload,
  UpdateMyProfilePayload,
} from "@/dtos/req/profile.req";
import type {
  MyAvatarResponse,
  MyMfaSetupResponse,
  MyMfaStateResponse,
  TenantUserProfileResponse,
  UpdateMyProfileResponse,
} from "@/dtos/res/profile.res";
import { ApiError } from "@/lib/api-error";
import { assertApiSuccess, unwrapDataModel } from "@/lib/api-response";
import { getStoredBearerToken } from "@/lib/auth-tokens";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/**
 * Self-service account endpoints for the **tenant** admin signed in to this portal.
 *
 * Nothing in this file works for a Super Admin, and that is a backend capability gap rather
 * than a product decision. Every endpoint here resolves the caller with
 * `int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)`, and a SuperAdmin session token
 * carries only `id` and `purpose: "superadmin-session"` — no `NameIdentifier`. Calling
 * `/v1/auth/me/change-password` with one does not 401 or 403; it throws inside `int.Parse(null)`
 * and comes back as a 500. The Super Admin surface therefore uses the OTP reset pair in
 * `super-admin-auth.service.ts` instead. See `SuperAdminSecurityPanel.tsx`.
 */

/**
 * A second axios client, used for exactly two paths.
 *
 * The shared instance pins `/v1/auth/mfa/setup` and `/v1/auth/mfa/enable` to the short-lived
 * `mfaToken` minted during login (`MFA_BEARER_AUTH_PATHS` in `src/lib/axiosInstance.ts`), and
 * deletes the Authorization header outright when no such token is in session storage. That is
 * correct for the login flow, where those two calls happen before a session exists. It is wrong
 * here: in Settings the user is already signed in, holds no `mfaToken`, and must authenticate
 * these calls with the live session token — so the shared instance would strip the header and
 * the request would 401.
 *
 * Rather than change a shared interceptor that the login flow depends on, in-app enrolment goes
 * out on this client. Errors are normalized to `ApiError` so callers cannot tell the difference.
 */
const sessionClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, ""),
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

sessionClient.interceptors.request.use((config) => {
  const token = getStoredBearerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function readErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["message", "title", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value) return value;
    }
  }
  return fallback;
}

sessionClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const message = readErrorMessage(
      error.response?.data,
      error.message || "Request failed",
    );
    return Promise.reject(new ApiError(message, status));
  },
);

/**
 * Some of these endpoints answer with the standard envelope and some answer with the bare body
 * (`return Ok(result)` on the controller). Reading `dataModel` when it is there and falling back
 * to the flat body keeps one shape at the call site.
 */
function readBody<T>(data: ApiResponse<T> | T, fallback: string): T {
  const enveloped = data as ApiResponse<T>;
  if (enveloped && typeof enveloped === "object" && "dataModel" in enveloped) {
    assertApiSuccess(enveloped, fallback);
    const model = unwrapDataModel<T>(enveloped);
    if (model) return model;
    throw new Error(enveloped.message || fallback);
  }
  return data as T;
}

/**
 * GET /v1/users/{id} — the signed-in tenant user's own record.
 *
 * There is no `/v1/users/me` read. The id comes from the `NameIdentifier` claim on the org
 * token; see `readTenantUserIdFromToken` in `src/hooks/useProfileSettings.ts`.
 */
export async function getTenantUserProfile(userId: number) {
  const { data } = await axiosInstance.get<
    ApiResponse<TenantUserProfileResponse>
  >(`/v1/users/${String(userId)}`);
  assertApiSuccess(data, "Could not load your profile.");
  const model = unwrapDataModel<TenantUserProfileResponse>(data);
  if (!model) {
    throw new Error(data.message || "Could not load your profile.");
  }
  return model;
}

/** PUT /v1/users/me — partial update of the signed-in tenant user's own details. */
export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  const { data } = await axiosInstance.put<ApiResponse<UpdateMyProfileResponse>>(
    "/v1/users/me",
    payload,
  );
  assertApiSuccess(data, "Could not save your profile.");
  return unwrapDataModel<UpdateMyProfileResponse>(data);
}

/**
 * POST /v1/auth/me/change-password.
 *
 * The API revokes every refresh token on success — the caller must sign the user out.
 */
export async function changeMyPassword(payload: ChangeMyPasswordPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    "/v1/auth/me/change-password",
    payload,
  );
  assertApiSuccess(data, "Could not change your password.");
  return data;
}

/** POST /v1/users/me/avatar — the URL must be HTTPS on host `res.cloudinary.com`. */
export async function setMyAvatar(payload: UpdateMyAvatarPayload) {
  const { data } = await axiosInstance.post<ApiResponse<MyAvatarResponse>>(
    "/v1/users/me/avatar",
    payload,
  );
  assertApiSuccess(data, "Could not update your photo.");
  return unwrapDataModel<MyAvatarResponse>(data)?.profileUrl ?? null;
}

/** DELETE /v1/users/me/avatar — clears the photo on both databases. */
export async function removeMyAvatar() {
  const { data } = await axiosInstance.delete<ApiResponse<MyAvatarResponse>>(
    "/v1/users/me/avatar",
  );
  assertApiSuccess(data, "Could not remove your photo.");
  return unwrapDataModel<MyAvatarResponse>(data)?.profileUrl ?? null;
}

/** POST /v1/auth/mfa/setup — mints (or re-returns) the pending TOTP secret. */
export async function setupMyMfa() {
  const { data } = await sessionClient.post<
    ApiResponse<MyMfaSetupResponse> | MyMfaSetupResponse
  >("/v1/auth/mfa/setup");
  return readBody<MyMfaSetupResponse>(
    data,
    "Could not start two-factor setup.",
  );
}

/** POST /v1/auth/mfa/enable — confirms the code. The current session stays valid. */
export async function enableMyMfa(payload: EnableMyMfaPayload) {
  const { data } = await sessionClient.post<
    ApiResponse<MyMfaStateResponse> | MyMfaStateResponse
  >("/v1/auth/mfa/enable", payload);
  return readBody<MyMfaStateResponse>(data, "Could not turn on two-factor.");
}

/**
 * POST /v1/auth/mfa/disable — re-authentication required, and the stored secret is cleared
 * rather than flagged off, so re-enrolling issues a new one.
 *
 * Not pinned to the login `mfaToken` by the shared interceptor, so it goes out on the shared
 * instance like everything else.
 */
export async function disableMyMfa(payload: DisableMyMfaPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<MyMfaStateResponse> | MyMfaStateResponse
  >("/v1/auth/mfa/disable", payload);
  return readBody<MyMfaStateResponse>(data, "Could not turn off two-factor.");
}
