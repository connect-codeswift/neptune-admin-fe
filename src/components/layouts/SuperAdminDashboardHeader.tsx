"use client";

import {
  DashboardHeaderShell,
  type DashboardHeaderShellProps,
} from "./DashboardHeaderShell";

export type SuperAdminDashboardHeaderProps = DashboardHeaderShellProps;

export function SuperAdminDashboardHeader({
  searchPlaceholder = "Search clients, companies, subscriptions...",
  ...props
}: Readonly<SuperAdminDashboardHeaderProps>) {
  return (
    <DashboardHeaderShell
      searchPlaceholder={searchPlaceholder}
      {...props}
    />
  );
}
