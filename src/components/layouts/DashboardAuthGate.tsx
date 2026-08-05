"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
    const checkAccess = () => {
      if (canAccessDashboard(kind)) {
        setAllowed(true);
        return;
      }

      setAllowed(false);
      router.replace(getFailedAccessRedirect(kind));
    };

    checkAccess();

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "neptune_admin_auth_token" ||
        event.key === "neptune_admin_org_token" ||
        event.key === "neptune_admin_role"
      ) {
        checkAccess();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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
