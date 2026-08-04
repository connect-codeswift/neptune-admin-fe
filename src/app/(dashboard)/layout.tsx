import { DashboardHeader, DashboardSidebar } from "@/components/layouts";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="grid min-h-screen pl-4 py-4 w-full grid-cols-[auto_1fr]">
            <DashboardSidebar />
            <main className="px-4 w-full h-full overflow-x-hidden flex flex-col">
                <DashboardHeader />
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}