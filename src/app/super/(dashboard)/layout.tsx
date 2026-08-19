import {
  SuperAdminDashboardHeader,
  SuperAdminSidebar,
  DashboardAuthGate,
  DashboardShell,
} from "@/components/layouts";
import { SuperAdminClientAccountsOrgSessionGuard } from "@/components/layouts/SuperAdminClientAccountsOrgSessionGuard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardAuthGate kind="super">
      <SuperAdminClientAccountsOrgSessionGuard />
      <DashboardShell
        sidebar={<SuperAdminSidebar />}
        header={<SuperAdminDashboardHeader />}
        // Platform staff work on wide monitors, and these screens are mostly
        // tables and summary cards. Uncapped, a row of four stat cards spreads
        // until each one is a mostly-empty rectangle and the companies table
        // separates its name column from its status column by a foot of glass.
        contentMaxWidthClassName="mx-auto w-full max-w-[1600px]"
      >
        {children}
      </DashboardShell>
    </DashboardAuthGate>
  );
}
