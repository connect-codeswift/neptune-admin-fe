/**
 * Field rules for the Settings forms.
 *
 * Hand-written on purpose: this repo has no schema library and must not gain one for a handful
 * of fields. Each rule below is the *same* rule the API enforces, copied from the DTO
 * attributes — a stricter client rule rejects values the API would have accepted, and a looser
 * one produces a 400 the user cannot act on.
 */

/**
 * `ChangePasswordDto.NewPassword` and `SuperAdminResetPasswordDto.NewPassword`:
 * 8+ characters with a letter, a digit and a symbol. Do not tighten this.
 */
export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

/** `UpdateUserProfileDto.ContactNo`: optional `+`, then 8-15 digits, nothing else. */
export const CONTACT_NO_PATTERN = /^\+?[1-9]\d{7,14}$/;

/** The super-admin reset OTP is exactly six numeric digits. */
export const OTP_PATTERN = /^\d{6}$/;

/** `UpdateUserProfileDto.FullName` — `[MaxLength(50)]`. */
export const FULL_NAME_MAX_LENGTH = 50;

/** `UpdateUserProfileDto.JobTitle` — `[MaxLength(100)]`. */
export const JOB_TITLE_MAX_LENGTH = 100;

export const PASSWORD_RULE_HINT =
  "At least 8 characters, including a letter, a number and a symbol.";

export type PasswordRule = Readonly<{
  id: string;
  label: string;
  test: (value: string) => boolean;
}>;

/**
 * `PASSWORD_PATTERN`, taken apart so a form can show which half of it is still missing.
 *
 * These four checks together are exactly the pattern above and nothing more — deliberately, so
 * the checklist can never turn green on a password the API refuses, nor red on one it accepts.
 * `PASSWORD_PATTERN` stays the authority for the yes/no answer; this list only explains it.
 * Change one and change the other.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    id: "letter",
    label: "A letter",
    test: (value) => /[A-Za-z]/.test(value),
  },
  {
    id: "number",
    label: "A number",
    test: (value) => /\d/.test(value),
  },
  {
    id: "symbol",
    label: "A symbol, such as ! ? @ or #",
    test: (value) => /[^A-Za-z\d]/.test(value),
  },
];

export type PasswordRuleResult = Readonly<{
  rule: PasswordRule;
  isMet: boolean;
}>;

export function evaluatePasswordRules(
  value: string,
): readonly PasswordRuleResult[] {
  return PASSWORD_RULES.map((rule) => ({ rule, isMet: rule.test(value) }));
}

export const CONTACT_NO_HINT =
  "8 to 15 digits, optionally starting with +. Spaces and brackets are removed when saved.";

/**
 * People type phone numbers with spaces, brackets and dashes; the API rejects all of them.
 * Stripping the punctuation is the difference between "saved" and a 400 nobody can act on.
 */
export function normalizeContactNo(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

/** Returns an error message, or null when the value is acceptable. */
export function validateFullName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter your name.";
  if (trimmed.length > FULL_NAME_MAX_LENGTH) {
    return `Name must be ${String(FULL_NAME_MAX_LENGTH)} characters or fewer.`;
  }
  return null;
}

export function validateJobTitle(value: string): string | null {
  if (value.trim().length > JOB_TITLE_MAX_LENGTH) {
    return `Job title must be ${String(JOB_TITLE_MAX_LENGTH)} characters or fewer.`;
  }
  return null;
}

/** Empty is allowed — the field is optional and an empty string clears it. */
export function validateContactNo(value: string): string | null {
  const normalized = normalizeContactNo(value);
  if (!normalized) return null;
  if (!CONTACT_NO_PATTERN.test(normalized)) {
    return "Enter a valid phone number: 8 to 15 digits, optionally starting with +.";
  }
  return null;
}

export function validateNewPassword(value: string): string | null {
  if (!value) return "Enter a new password.";
  if (!PASSWORD_PATTERN.test(value)) return PASSWORD_RULE_HINT;
  return null;
}

export function validatePasswordConfirmation(
  newPassword: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return "Re-enter the new password.";
  if (newPassword !== confirmPassword) return "The two passwords do not match.";
  return null;
}

export function validateOtp(value: string): string | null {
  if (!value.trim()) return "Enter the 6-digit code from your email.";
  if (!OTP_PATTERN.test(value.trim())) return "The code is 6 digits.";
  return null;
}

/** Six digits from an authenticator app, same shape as the reset OTP. */
export function validateAuthenticatorCode(value: string): string | null {
  if (!value.trim()) return "Enter the 6-digit code from your authenticator app.";
  if (!OTP_PATTERN.test(value.trim())) return "The code is 6 digits.";
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}

/**
 * `UpdateUserAvatarDto` is validated server-side against an allow-list of exactly one host.
 * Checking it here too means a bad URL is refused before a round trip rather than after a 400.
 */
export function isAllowedAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}
