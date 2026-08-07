import {
  AdminDashboardHeader,
  AdminDashboardSidebar,
  DashboardAuthGate,
} from "@/components/layouts";
import { TenantContextProvider } from "@/providers/TenantContextProvider";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardAuthGate kind="org">
      <TenantContextProvider>
        <div className="grid h-screen min-h-0 w-full grid-cols-[auto_1fr] items-stretch overflow-hidden py-6 pl-6">
          <div className="flex h-full min-h-0">
            <AdminDashboardSidebar />
          </div>
          <main className="flex h-full min-h-0 w-full flex-col gap-8 overflow-hidden px-6">
            <AdminDashboardHeader />
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-none">
              {children}
            </div>
          </main>
        </div>
      </TenantContextProvider>
    </DashboardAuthGate>
  );
}
