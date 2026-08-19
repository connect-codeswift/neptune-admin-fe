import {
  AdminDashboardHeader,
  AdminDashboardSidebar,
  DashboardAuthGate,
  DashboardShell,
} from "@/components/layouts";
import { TenantContextProvider } from "@/providers/TenantContextProvider";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardAuthGate kind="org">
      <TenantContextProvider>
        <DashboardShell
          sidebar={<AdminDashboardSidebar />}
          header={<AdminDashboardHeader />}
        >
          {children}
        </DashboardShell>
      </TenantContextProvider>
    </DashboardAuthGate>
  );
}
