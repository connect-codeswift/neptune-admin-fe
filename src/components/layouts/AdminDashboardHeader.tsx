"use client";

import { usePathname, useRouter } from "next/navigation";
import { parseOrgSitePath } from "@/lib/admin-sidebar";
import { clearOrgSession, isSuperAdminRole } from "@/lib/auth-tokens";
import { SUPER_ADMIN_BASE_PATH } from "@/lib/super-admin-sidebar-items";
import {
  DashboardHeaderShell,
  type DashboardHeaderShellProps,
} from "./DashboardHeaderShell";
import { IconButton } from "../ui/IconButton";

export type AdminDashboardHeaderProps = DashboardHeaderShellProps;

export function AdminDashboardHeader({
  searchPlaceholder = "Search Incidents, actions, docs...",
  ...props
}: Readonly<AdminDashboardHeaderProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const showSuperAdminBack =
    isSuperAdminRole() && parseOrgSitePath(pathname) !== null;

  const handleBackToSuperAdmin = () => {
    clearOrgSession();
    router.push(`${SUPER_ADMIN_BASE_PATH}/dashboard`);
  };

  return (
    <DashboardHeaderShell
      searchPlaceholder={searchPlaceholder}
      leadingSlot={
        showSuperAdminBack ? (
          <IconButton
            icon="lucide:arrow-left"
            label="Back to super admin dashboard"
            variant="soft"
            shape="rounded"
            size="md"
            onClick={handleBackToSuperAdmin}
            className="size-11 shrink-0 border-darkest/10 bg-white shadow-lg hover:bg-lightgray"
          />
        ) : null
      }
      {...props}
    />
  );
}
