/**
 * Request bodies for the "my account" endpoints behind Settings.
 *
 * Everything here is tenant-scoped. A Super Admin session cannot use any of it — its JWT
 * carries only `id` and `purpose: "superadmin-session"`, with no `NameIdentifier` claim, and
 * every one of these endpoints resolves the caller from that claim. See the note at the top of
 * `src/services/profile.service.ts`.
 */

/**
 * PUT /v1/users/me — partial. Only the fields present are written, so a card that owns one
 * part of the profile can save it without resending the rest.
 *
 * API validation: `fullName` maxLength 50, `jobTitle` maxLength 100,
 * `contactNo` must match `^\+?[1-9]\d{7,14}$`.
 */
export type UpdateMyProfilePayload = {
  fullName?: string;
  contactNo?: string;
  jobTitle?: string;
};

/**
 * POST /v1/auth/me/change-password.
 *
 * `newPassword` must match `^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$` — the same rule the
 * API enforces. On success every refresh token the user holds is revoked, so the caller has to
 * sign out afterwards.
 */
export type ChangeMyPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

/**
 * POST /v1/users/me/avatar.
 *
 * `profileUrl` must be HTTPS with host exactly `res.cloudinary.com`; any other host is a 400.
 */
export type UpdateMyAvatarPayload = {
  profileUrl: string;
};

/** POST /v1/auth/mfa/enable — exactly 6 numeric digits. */
export type EnableMyMfaPayload = {
  code: string;
};

/**
 * POST /v1/auth/mfa/disable — at least one of the two is required. Password accounts must send
 * `currentPassword`; SSO-only accounts have no password hash to verify and send `code` instead.
 */
export type DisableMyMfaPayload = {
  currentPassword?: string;
  code?: string;
};
