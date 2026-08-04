const MFA_TOKEN_KEY = "neptune_admin_mfa_token";

export function setMfaToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MFA_TOKEN_KEY, token);
}

export function getMfaToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(MFA_TOKEN_KEY);
}

export function clearMfaToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MFA_TOKEN_KEY);
}
