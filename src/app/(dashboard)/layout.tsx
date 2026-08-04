import { DashboardHeader, SuperAdminDashboardSidebar } from "@/components/layouts";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid h-screen min-h-0 w-full grid-cols-[auto_1fr] overflow-hidden py-6 pl-6">
      <SuperAdminDashboardSidebar />
      <main className="flex h-full min-h-0 w-full flex-col gap-8 overflow-hidden px-6">
        <DashboardHeader />
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-none">
          {children}
        </div>
      </main>
    </div>
  );
}
