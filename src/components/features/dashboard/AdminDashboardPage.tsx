"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  KpiSummaryCard,
  KpiTrendCard,
  RecentActivityCard,
  type RecentActivityItem,
} from "@/components/ui";
import { useOrgDashboard } from "@/hooks/useOrgDashboard";
import {
  activatedModuleCodesToIds,
  getModuleLabel,
  parseActivatedModuleCodes,
} from "@/lib/ehs-modules";

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function AdminDashboardPage({
  description = "System overview, user management, and configuration",
}: Readonly<{
  description?: string;
}>) {
  const { summary, activity, isLoading, isError, error, refetch } =
    useOrgDashboard(20);

  const kpiCards = useMemo(() => {
    if (!summary) return [];

    return [
      {
        value: summary.users.total,
        label: "Total Users",
        trendLabel: `${summary.users.active} active`,
        trend: "up" as const,
        data: [summary.users.total],
      },
      {
        value: summary.users.active,
        label: "Active Users",
        trendLabel: `${summary.users.pendingSetup} pending`,
        trend: "up" as const,
        data: [summary.users.active],
      },
      {
        value: summary.sites.total,
        label: "Sites",
        trendLabel: "live",
        trend: "up" as const,
        data: [summary.sites.total],
      },
      {
        value: summary.roles.total,
        label: "Roles",
        trendLabel: `${summary.roles.custom} custom`,
        trend: "up" as const,
        data: [summary.roles.total],
      },
    ];
  }, [summary]);

  const moduleStats = useMemo(() => {
    if (!summary) return [];
    const moduleCodes = parseActivatedModuleCodes(
      summary.activatedModules.modules,
    );
    const moduleIds = activatedModuleCodesToIds(moduleCodes);

    if (moduleIds.length === 0) {
      return [
        {
          title: "Activated Modules",
          value: summary.activatedModules.moduleCount,
          activeCount: summary.activatedModules.moduleCount,
        },
      ];
    }

    return moduleIds.map((moduleId) => ({
      title: getModuleLabel(moduleId),
      value: 1,
      activeCount: 1,
    }));
  }, [summary]);

  const activityItems = useMemo<RecentActivityItem[]>(
    () =>
      activity.map((item, index) => ({
        id: `${item.type}-${item.occurredAt}-${index}`,
        actor: item.actor ?? "System",
        action: item.type.replace(/([A-Z])/g, " $1").trim(),
        target: item.description,
        time: formatRelativeTime(item.occurredAt),
      })),
    [activity],
  );

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
              onClick={() => {
                void refetch();
                toast.success("Dashboard refreshed.");
              }}
            >
              Refresh
            </Button>
          </>
        }
      />

      {isLoading ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          Loading dashboard…
        </p>
      ) : null}

      {isError ? (
        <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
          {error instanceof Error ? error.message : "Failed to load dashboard."}
        </p>
      ) : null}

      {!isLoading && !isError && summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((kpi) => (
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
              title="Organization"
              action={
                <p className="text5 text-gray">
                  {summary.access.isPermanent
                    ? "Permanent access"
                    : summary.access.daysRemaining != null
                      ? `${summary.access.daysRemaining} days remaining`
                      : "Access window active"}
                </p>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {moduleStats.length > 0 ? (
                  moduleStats.map((module) => (
                    <KpiSummaryCard
                      key={module.title}
                      title={module.title}
                      value={module.value}
                      activeCount={module.activeCount}
                    />
                  ))
                ) : (
                  <p className="text5 text-gray sm:col-span-2 xl:col-span-3">
                    No modules activated for this organization yet.
                  </p>
                )}
              </div>
            </DetailCard>

            <RecentActivityCard items={activityItems} />
          </div>
        </>
      ) : null}
    </div>
  );
}
