"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import type {
  SuperAdminForgotPasswordPayload,
  SuperAdminResetPasswordPayload,
} from "@/dtos/req/auth.req";
import type {
  ChangeMyPasswordPayload,
  DisableMyMfaPayload,
  EnableMyMfaPayload,
  UpdateMyProfilePayload,
} from "@/dtos/req/profile.req";
import type {
  OrgMeAccountResponse,
  TenantUserProfileResponse,
} from "@/dtos/res/profile.res";
import { useTenantScope, type TenantScope } from "@/hooks/useTenantScope";
import { ApiError } from "@/lib/api-error";
import { assertApiSuccess, unwrapDataModel } from "@/lib/api-response";
import { getLogoutLoginPath, logoutSession } from "@/lib/auth-flow";
import { parseJwtPayload } from "@/lib/auth-redirect";
import {
  AUTH_SESSION_EVENT,
  getAuthEmail,
  getAuthRole,
  getOrgToken,
  type StoredAuthRole,
} from "@/lib/auth-tokens";
import { getOrgMe } from "@/services/org-auth.service";
import {
  changeMyPassword,
  disableMyMfa,
  enableMyMfa,
  getTenantUserProfile,
  removeMyAvatar,
  setMyAvatar,
  setupMyMfa,
  updateMyProfile,
} from "@/services/profile.service";
import {
  superAdminForgotPassword,
  superAdminResetPassword,
} from "@/services/super-admin-auth.service";

export const PROFILE_SETTINGS_QUERY_KEY = ["profile-settings"] as const;
export const TENANT_ORG_ACCOUNT_QUERY_KEY = [
  ...PROFILE_SETTINGS_QUERY_KEY,
  "org-account",
] as const;
export const TENANT_USER_PROFILE_QUERY_KEY = [
  ...PROFILE_SETTINGS_QUERY_KEY,
  "tenant-user",
] as const;

export function tenantOrgAccountQueryKey(scope: TenantScope) {
  return [...TENANT_ORG_ACCOUNT_QUERY_KEY, ...scope.key] as const;
}

export function tenantUserProfileQueryKey(userId: number | null) {
  return [...TENANT_USER_PROFILE_QUERY_KEY, userId] as const;
}

/* -------------------------------------------------------------------------- */
/* Who is signed in                                                            */
/* -------------------------------------------------------------------------- */

/**
 * ASP.NET writes `ClaimTypes.NameIdentifier` under its full XML-schema URI. The short forms are
 * listed too because a token minted by a different code path may use them.
 */
const USER_ID_CLAIM_KEYS = [
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  "nameid",
  "NameIdentifier",
  "sub",
];

const EMAIL_CLAIM_KEYS = [
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "email",
];

const NAME_CLAIM_KEYS = [
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  "name",
];

function readStringClaim(
  payload: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

/**
 * The signed-in tenant user's own id.
 *
 * There is no `/v1/users/me` read endpoint, so the id has to come from the token. Returns null
 * for a SuperAdmin org-scoped token — that token carries `id` and `purpose`, never
 * `NameIdentifier`, precisely because there is no tenant user behind it. Callers must treat
 * null as "this session has no personal profile", not as an error.
 */
export function readTenantUserIdFromToken(token: string | null): number | null {
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const raw = readStringClaim(payload, USER_ID_CLAIM_KEYS);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export type SettingsIdentity = Readonly<{
  role: StoredAuthRole | null;
  /** The email captured at login. For a Super Admin this is the only identity that exists. */
  email: string | null;
  /** Null on a SuperAdmin session, or before the token has been read on the client. */
  tenantUserId: number | null;
  /** The name claim on the org token, used only as a first-paint fallback. */
  tokenFullName: string | null;
  /** False during SSR and the first client render. */
  isReady: boolean;
}>;

const SERVER_IDENTITY: SettingsIdentity = {
  role: null,
  email: null,
  tenantUserId: null,
  tokenFullName: null,
  isReady: false,
};

/**
 * Cached so the snapshot is referentially stable — `useSyncExternalStore` re-reads on every
 * render and loops forever if a fresh object comes back each time. Same arrangement the theme
 * store uses, and for the same reason: this data lives in `localStorage`, which does not exist
 * on the server, so reading it during render would hydrate mismatched.
 */
let identitySnapshot: SettingsIdentity = SERVER_IDENTITY;
let identitySource = "";

function getIdentitySnapshot(): SettingsIdentity {
  const token = getOrgToken();
  const role = getAuthRole();
  const email = getAuthEmail();
  const source = `${role ?? ""}|${email ?? ""}|${token ?? ""}`;

  if (identitySource !== source || !identitySnapshot.isReady) {
    const payload = token ? parseJwtPayload(token) : null;
    identitySource = source;
    identitySnapshot = {
      role,
      email:
        email ?? (payload ? readStringClaim(payload, EMAIL_CLAIM_KEYS) : null),
      tenantUserId: readTenantUserIdFromToken(token),
      tokenFullName: payload ? readStringClaim(payload, NAME_CLAIM_KEYS) : null,
      isReady: true,
    };
  }

  return identitySnapshot;
}

function getServerIdentitySnapshot(): SettingsIdentity {
  return SERVER_IDENTITY;
}

function subscribeToIdentity(onStoreChange: () => void): () => void {
  globalThis.addEventListener?.(AUTH_SESSION_EVENT, onStoreChange);
  globalThis.addEventListener?.("storage", onStoreChange);

  return () => {
    globalThis.removeEventListener?.(AUTH_SESSION_EVENT, onStoreChange);
    globalThis.removeEventListener?.("storage", onStoreChange);
  };
}

export function useSettingsIdentity(): SettingsIdentity {
  return useSyncExternalStore(
    subscribeToIdentity,
    getIdentitySnapshot,
    getServerIdentitySnapshot,
  );
}

/* -------------------------------------------------------------------------- */
/* Reading the tenant account                                                  */
/* -------------------------------------------------------------------------- */

async function fetchOrgAccount(): Promise<OrgMeAccountResponse> {
  const response = await getOrgMe();
  assertApiSuccess(response, "Could not load your account.");
  const model = unwrapDataModel<OrgMeAccountResponse>(response);
  if (!model) {
    throw new Error(response.message || "Could not load your account.");
  }
  return model;
}

export type TenantAccount = Readonly<{
  fullName: string;
  email: string;
  contactNo: string;
  jobTitle: string;
  profileUrl: string | null;
  roleName: string;
  organizationName: string;
  /** There is no `GET /v1/auth/mfa/status`; this rides on `GET /v1/organizations/me`. */
  mfaEnabled: boolean;
}>;

export type TenantAccountResult = Readonly<{
  account: TenantAccount | null;
  isLoading: boolean;
  isError: boolean;
  /**
   * True when the session is a SuperAdmin org-scoped token: it can browse this company but has
   * no tenant user behind it, so there is no personal profile to show.
   */
  hasNoTenantUser: boolean;
}>;

/**
 * The signed-in tenant admin's own account, assembled from two calls because no single endpoint
 * returns it: `GET /v1/organizations/me` carries the org plus `jobTitle` and `mfaEnabled`, and
 * `GET /v1/users/{id}` carries name, email, phone, photo and role.
 */
export function useTenantAccount(): TenantAccountResult {
  const scope = useTenantScope();
  const identity = useSettingsIdentity();
  const userId = identity.tenantUserId;

  const orgQuery = useQuery({
    queryKey: tenantOrgAccountQueryKey(scope),
    queryFn: fetchOrgAccount,
    enabled: scope.ready,
  });

  const userQuery = useQuery({
    queryKey: tenantUserProfileQueryKey(userId),
    queryFn: () => getTenantUserProfile(userId as number),
    enabled: userId !== null,
  });

  if (identity.isReady && userId === null) {
    return {
      account: null,
      isLoading: false,
      isError: false,
      hasNoTenantUser: true,
    };
  }

  const org = orgQuery.data;
  const user: TenantUserProfileResponse | undefined = userQuery.data;

  if (!org && !user) {
    return {
      account: null,
      isLoading: orgQuery.isPending || userQuery.isPending || !identity.isReady,
      isError: orgQuery.isError && userQuery.isError,
      hasNoTenantUser: false,
    };
  }

  return {
    account: {
      fullName: user?.fullName ?? identity.tokenFullName ?? "",
      email: user?.email ?? identity.email ?? "",
      contactNo: user?.contactNo ?? "",
      jobTitle: user?.jobTitle ?? org?.jobTitle ?? "",
      profileUrl: user?.profileUrl ?? null,
      roleName: user?.roleName ?? "",
      organizationName: org?.name ?? "",
      mfaEnabled: org?.mfaEnabled === true,
    },
    isLoading: orgQuery.isPending || userQuery.isPending,
    isError: orgQuery.isError && userQuery.isError,
    hasNoTenantUser: false,
  };
}

/* -------------------------------------------------------------------------- */
/* Tenant mutations                                                            */
/* -------------------------------------------------------------------------- */

function useInvalidateProfileSettings() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: PROFILE_SETTINGS_QUERY_KEY,
    });
  };
}

export function useUpdateMyProfile() {
  const invalidate = useInvalidateProfileSettings();

  return useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) => updateMyProfile(payload),
    onSuccess: invalidate,
  });
}

/**
 * The API revokes every refresh token on success, so the caller signs the user out. Nothing is
 * invalidated here — the cache is about to be thrown away with the session.
 */
export function useChangeMyPassword() {
  return useMutation({
    mutationFn: (payload: ChangeMyPasswordPayload) => changeMyPassword(payload),
  });
}

export function useSetMyAvatar() {
  const invalidate = useInvalidateProfileSettings();

  return useMutation({
    mutationFn: (profileUrl: string) => setMyAvatar({ profileUrl }),
    onSuccess: invalidate,
  });
}

export function useRemoveMyAvatar() {
  const invalidate = useInvalidateProfileSettings();

  return useMutation({
    mutationFn: () => removeMyAvatar(),
    onSuccess: invalidate,
  });
}

export function useSetupMyMfa() {
  return useMutation({ mutationFn: () => setupMyMfa() });
}

export function useEnableMyMfa() {
  const invalidate = useInvalidateProfileSettings();

  return useMutation({
    mutationFn: (payload: EnableMyMfaPayload) => enableMyMfa(payload),
    onSuccess: invalidate,
  });
}

export function useDisableMyMfa() {
  const invalidate = useInvalidateProfileSettings();

  return useMutation({
    mutationFn: (payload: DisableMyMfaPayload) => disableMyMfa(payload),
    onSuccess: invalidate,
  });
}

/* -------------------------------------------------------------------------- */
/* Super Admin password reset                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The platform account's only self-service password path.
 *
 * `POST /v1/auth/me/change-password` is not an option: it reads the tenant `Users` table via the
 * `NameIdentifier` claim, which a SuperAdmin token does not carry, so it fails inside
 * `int.Parse(null)` and returns a 500 rather than a clean 401. The OTP pair below is the flow
 * that works today with no backend change, which is why the Super Admin security card asks for
 * an emailed code instead of the current password.
 */
export function useSuperAdminSendResetCode() {
  return useMutation({
    mutationFn: async (payload: SuperAdminForgotPasswordPayload) => {
      const response = await superAdminForgotPassword(payload);
      assertApiSuccess(response, "Could not send the verification code.");
      return response;
    },
  });
}

export function useSuperAdminResetPassword() {
  return useMutation({
    mutationFn: async (payload: SuperAdminResetPasswordPayload) => {
      const response = await superAdminResetPassword(payload);
      assertApiSuccess(response, "Could not change your password.");
      return response;
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The API's own message when there is one — "Current password is incorrect.",
 * "New password must be different from the current one." and the rest are written to be shown
 * to the user, and replacing them with a generic string loses the only actionable detail.
 */
export function getSettingsErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/**
 * Ends the session and sends the user to login.
 *
 * Used after a password change in both areas: the credential they signed in with no longer
 * exists, and on the tenant side the API has already revoked every refresh token, so staying
 * put only delays an unexplained session drop.
 */
export function useSignOutAfterPasswordChange() {
  const router = useRouter();

  return () => {
    logoutSession();
    router.replace(getLogoutLoginPath());
  };
}
