"use client";

import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  KpiSummaryCard,
  KpiTrendCard,
  RecentActivityCard,
} from "@/components/ui";
import {
  ADMIN_ACTIVITY_LOG,
  ADMIN_DASHBOARD_KPIS,
  ADMIN_MODULE_STATS,
} from "@/lib/admin-dashboard.dummy";

export function AdminDashboardPage({
  description = "System overview, user management, and configuration",
}: Readonly<{
  description?: string;
}>) {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Admin Dashboard"
        description={description}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:refresh-cw"
              onClick={() => toast.success("Dashboard refreshed.")}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:download"
              onClick={() => toast.success("Report export started.")}
            >
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_DASHBOARD_KPIS.map((kpi) => (
          <KpiTrendCard
            key={kpi.label}
            value={kpi.value}
            label={kpi.label}
            data={kpi.data}
            trendLabel={kpi.trendLabel}
            trend={kpi.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DetailCard
          title="Module Statistics"
          action={
            <p className="text5 text-gray">All active compliance modules</p>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ADMIN_MODULE_STATS.map((module) => (
              <KpiSummaryCard
                key={module.title}
                title={module.title}
                value={module.value}
                activeCount={module.activeCount}
              />
            ))}
          </div>
        </DetailCard>

        <RecentActivityCard items={ADMIN_ACTIVITY_LOG} viewHref="#" />
      </div>
    </div>
  );
}
