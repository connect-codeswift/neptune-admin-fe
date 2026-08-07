"use client";

import { useEffect, useState } from "react";
import { getAuthEmail, getAuthRole } from "@/lib/auth-tokens";

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
 * Resolved after mount because it reads localStorage, which does not exist
 * during SSR — reading it in render would make the server and client markup
 * disagree. The role label stays blank until it resolves rather than guessing,
 * so a SuperAdmin is never briefly labelled an Organization Admin.
 */
export function useSignedInUser(): SignedInUser {
  const [user, setUser] = useState<SignedInUser>({
    name: "Signed in",
    role: "",
  });

  useEffect(() => {
    const role = getAuthRole();
    setUser({
      name: getAuthEmail() ?? "Signed in",
      role:
        role === "super-admin"
          ? "Neptune Admin"
          : role === "admin"
            ? "Organization Admin"
            : "",
    });
  }, []);

  return user;
}
