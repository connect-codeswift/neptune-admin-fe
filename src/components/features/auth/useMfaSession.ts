"use client";

import { useEffect, useState } from "react";
import { getMfaToken } from "@/lib/auth-flow";
import {
  getPortalAccountType,
  type PortalAccountType,
} from "@/lib/portal-auth";

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
 * Read in an effect rather than in a `useState` lazy initialiser, which is what these screens
 * used to do. `getMfaToken` reads `sessionStorage` and `getPortalAccountType` reads it too;
 * both return null on the server and a real value in the browser, so initialising state from
 * them made the server and client render different trees and React threw a hydration mismatch
 * on every visit to `/login/mfa` and `/login/mfa-setup`.
 *
 * Reading after mount costs one extra render, which is why `isReady` exists: callers show a
 * neutral "checking" state for that render instead of guessing, and only decide whether to
 * redirect once the answer is actually known. Same shape as `useSettingsIdentity` and the theme
 * store, which solved the same problem the same way.
 */
export function useMfaSession(): MfaSession {
  const [session, setSession] = useState<MfaSession>(PENDING_SESSION);

  useEffect(() => {
    setSession({
      mfaToken: getMfaToken(),
      accountType: getPortalAccountType(),
      isReady: true,
    });
  }, []);

  return session;
}
