"use client";

import { getMfaToken } from "@/lib/auth-flow";
import {
  getPortalAccountType,
  type PortalAccountType,
} from "@/lib/portal-auth";
import { useHydrated } from "@/lib/use-hydrated";

export type MfaSession = Readonly<{
  /** The short-lived token minted by the login step. Null once it is gone or expired. */
  mfaToken: string | null;
  accountType: PortalAccountType | null;
  /** False during SSR and the first client render, before browser storage has been read. */
  isReady: boolean;
}>;

const PENDING_SESSION: MfaSession = {
  mfaToken: null,
  accountType: null,
  isReady: false,
};

/**
 * The half-finished sign-in that the two MFA screens run on.
 *
 * Read only once hydrated, never in a `useState` lazy initialiser, which is what these screens
 * used to do. `getMfaToken` reads `sessionStorage` and `getPortalAccountType` reads it too;
 * both return null on the server and a real value in the browser, so initialising state from
 * them made the server and client render different trees and React threw a hydration mismatch
 * on every visit to `/login/mfa` and `/login/mfa-setup`.
 *
 * The first render still answers "not known yet", which is why `isReady` exists: callers show a
 * neutral "checking" state for that render instead of guessing, and only decide whether to
 * redirect once the answer is actually known.
 */
export function useMfaSession(): MfaSession {
  const isHydrated = useHydrated();

  if (!isHydrated) return PENDING_SESSION;

  return {
    mfaToken: getMfaToken(),
    accountType: getPortalAccountType(),
    isReady: true,
  };
}
