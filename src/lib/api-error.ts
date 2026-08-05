export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const ORG_TOKEN_RESELECT_EVENT = "neptune:org-token-reselect";

export function isOrgTokenReselectMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("no company selected") ||
    normalized.includes("tenant database is not resolved") ||
    normalized.includes("please login first")
  );
}

export function dispatchOrgTokenReselect(reason?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ORG_TOKEN_RESELECT_EVENT, { detail: { reason } }),
  );
}
