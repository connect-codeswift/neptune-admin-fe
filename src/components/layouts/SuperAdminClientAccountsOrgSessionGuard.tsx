"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearOrgSession } from "@/lib/auth-tokens";

/** Clears stale org tokens when viewing platform-admin client account pages. */
export function SuperAdminClientAccountsOrgSessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/super/client-accounts")) {
      clearOrgSession();
    }
  }, [pathname]);

  return null;
}
