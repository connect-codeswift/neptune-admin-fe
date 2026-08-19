/** Response payloads for the "my account" endpoints behind Settings. */

/**
 * `dataModel` of GET /v1/users/{id} (`UserSummaryDto`).
 *
 * This is the only endpoint that returns the signed-in tenant user's own name, email, phone and
 * photo. `GET /v1/organizations/me` does not — it carries the organization plus exactly three
 * user-scoped fields (`jobTitle`, `mfaEnabled`, `mfaPromptDismissed`), so Settings needs both.
 */
export type TenantUserProfileResponse = {
  id: number;
  email?: string | null;
  fullName?: string | null;
  contactNo?: string | null;
  profileUrl?: string | null;
  jobTitle?: string | null;
  gender?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  organizationId?: number | null;
  siteId?: number | null;
  isInvited?: boolean | null;
};

/**
 * The user-scoped slice of `dataModel` from GET /v1/organizations/me (`OrgMeDto`).
 *
 * `mfaEnabled` lives here rather than on a dedicated endpoint: there is no
 * `GET /v1/auth/mfa/status`, so this is the only way to render the two-factor card in its true
 * state. It is `false` for a SuperAdmin org-scoped token, which has no tenant user behind it.
 */
export type OrgMeAccountResponse = {
  id: number;
  name?: string | null;
  jobTitle?: string | null;
  mfaEnabled?: boolean | null;
  mfaPromptDismissed?: boolean | null;
};

/** `dataModel` of PUT /v1/users/me (`UserProfileResponseDto`). */
export type UpdateMyProfileResponse = {
  id: number;
  fullName?: string | null;
  contactNo?: string | null;
  jobTitle?: string | null;
};

/** `dataModel` of POST and DELETE /v1/users/me/avatar. Null after a remove. */
export type MyAvatarResponse = {
  profileUrl?: string | null;
};

/** Body of POST /v1/auth/mfa/setup. Not enveloped — the controller returns it directly. */
export type MyMfaSetupResponse = {
  mfaSecret: string;
  otpAuthUri: string;
};

/** Body of POST /v1/auth/mfa/enable and /v1/auth/mfa/disable. */
export type MyMfaStateResponse = {
  mfaEnabled: boolean;
};
