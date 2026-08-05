"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessSuperDashboard } from "@/lib/dashboard-auth";

export default function SuperIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      canAccessSuperDashboard() ? "/super/dashboard" : "/super/login",
    );
  }, [router]);

  return null;
}
