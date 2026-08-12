"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AUTH_SESSION_EVENT } from "@/lib/auth-tokens";
import {
  canAccessDashboard,
  getFailedAccessRedirect,
  type DashboardKind,
} from "@/lib/dashboard-auth";

export type DashboardAuthGateProps = Readonly<{
  kind: DashboardKind;
  children: ReactNode;
}>;

export function DashboardAuthGate({ kind, children }: DashboardAuthGateProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const denyAccess = () => {
      setAllowed(false);
      router.replace(getFailedAccessRedirect());
    };

    const checkAccess = () => {
      if (canAccessDashboard(kind)) {
        setAllowed(true);
        return true;
      }
      return false;
    };

    if (checkAccess()) {
      return;
    }

    // Tokens may have just been written before navigation completed.
    const retryTimer = window.setTimeout(() => {
      if (!checkAccess()) {
        denyAccess();
      }
    }, 150);

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "neptune_admin_auth_token" ||
        event.key === "neptune_admin_org_token" ||
        event.key === "neptune_admin_role"
      ) {
        checkAccess();
      }
    };

    const handleSessionUpdate = () => {
      checkAccess();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_SESSION_EVENT, handleSessionUpdate);

    return () => {
      window.clearTimeout(retryTimer);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_SESSION_EVENT, handleSessionUpdate);
    };
  }, [kind, router]);

  if (allowed !== true) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text5 text-gray">
        Checking session…
      </div>
    );
  }

  return children;
}
