"use client";

import { getAuthEmail, getAuthRole } from "@/lib/auth-tokens";
import { useHydrated } from "@/lib/use-hydrated";

const ROLE_LABELS: Readonly<Record<string, string>> = {
  "super-admin": "Neptune Admin",
  admin: "Organization Admin",
};

export type SignedInUser = {
  name: string;
  role: string;
};

/**
 * Who is signed in, for the sidebar chip.
 *
 * Both sidebars previously hardcoded "Ahmed Alsakkaf / Neptune Admin". There is
 * no endpoint that returns the current account and a SuperAdmin session token
 * carries only `id` and `purpose`, so the email captured at login is the only
 * identity available.
 *
 * Resolved only once hydrated because it reads localStorage, which does not
 * exist during SSR — reading it on the server would make the server and client
 * markup disagree. The role label stays blank for that first render rather than
 * guessing, so a SuperAdmin is never briefly labelled an Organization Admin.
 */
export function useSignedInUser(): SignedInUser {
  const isHydrated = useHydrated();

  if (!isHydrated) return { name: "Signed in", role: "" };

  return {
    name: getAuthEmail() ?? "Signed in",
    role: ROLE_LABELS[getAuthRole() ?? ""] ?? "",
  };
}
