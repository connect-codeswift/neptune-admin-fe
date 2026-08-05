const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "qq.com",
  "163.com",
  "126.com",
] as const;

/**
 * Returns true when the email uses a personal/consumer provider.
 */
export function isPersonalEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return PERSONAL_EMAIL_DOMAINS.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`),
  );
}

/**
 * Ensures the phone number is E.164-friendly by prefixing "+" when missing.
 * Strips common formatting characters. Returns "" for empty input.
 */
export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone?.trim()) return "";

  let value = phone.trim().replace(/[\s()-]/g, "");

  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  } else if (!value.startsWith("+")) {
    value = `+${value}`;
  }

  return value;
}

/** Basic E.164 check: + followed by 8–15 digits, first digit 1–9. */
export function isValidPhoneNumber(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
