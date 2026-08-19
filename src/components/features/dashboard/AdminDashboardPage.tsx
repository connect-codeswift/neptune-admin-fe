"use client";

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import {
  Button,
  KpiSummaryCard,
  RecentActivityCard,
  type RecentActivityItem,
} from "@/components/ui";
import { useOrgDashboard } from "@/hooks/useOrgDashboard";
import {
  activatedModuleCodesToIds,
  getModuleLabel,
  parseActivatedModuleCodes,
} from "@/lib/ehs-modules";
import { getAllSitesOfThisOrg } from "@/lib/org-sites";
import { StatCard } from "./StatCard";

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

/**
 * The site list lives in the tenant context written at select-company, which is
 * localStorage and therefore absent during SSR.
 *
 * This used to be `useState` + `useEffect(setSiteName)`, which is the pattern
 * `react-hooks/set-state-in-effect` exists to catch: it renders once with the
 * wrong value and schedules a second render to correct it. `useSyncExternalStore`
 * says the same thing declaratively — the server snapshot is "unknown", the
 * client snapshot reads storage — and produces identical markup on first paint
 * without the extra state. The store never changes underneath us within a page
 * view, so `subscribe` has nothing to listen to.
 */
function subscribeToTenantSites(): () => void {
  return () => undefined;
}

function getServerSiteName(): string | undefined {
  return undefined;
}

/** The number a card shows, and the sentence explaining what it is made of. */
type SummaryStat = Readonly<{
  label: string;
  value: number;
  detail: string;
  icon: string;
}>;

type ModuleStat = Readonly<{
  title: string;
  value: number;
  activeCount: number;
}>;

function describeAccess(access: {
  isPermanent: boolean;
  daysRemaining: number | null;
}): string {
  if (access.isPermanent) return "Permanent access";
  if (access.daysRemaining != null) {
    return `${access.daysRemaining} day${access.daysRemaining === 1 ? "" : "s"} remaining`;
  }
  return "Access window active";
}

export function AdminDashboardPage({
  description = "System overview, user management, and configuration",
  company,
  site,
}: Readonly<{
  description?: string;
  company?: string;
  site?: string;
}>) {
  const { summary, activity, isLoading, isError, error, refetch } =
    useOrgDashboard(20);

  const siteName = useSyncExternalStore(
    subscribeToTenantSites,
    () => {
      if (!company) return undefined;
      return getAllSitesOfThisOrg(company).find((entry) => entry.id === site)
        ?.name;
    },
    getServerSiteName,
  );

  // The organization name is authoritative from the summary. Previously this
  // came from getDummyOrganization(company) in the server component, keyed by
  // the real organization id, so every company rendered as dummy org "1".
  let subtitle = description;
  if (summary) {
    subtitle = [summary.organization.name, siteName].filter(Boolean).join(" · ");
  }

  // Plain counts with their composition. The summary endpoint returns scalars,
  // so there is no series here and these are not trends — see StatCard.
  let summaryStats: SummaryStat[] = [];
  if (summary) {
    summaryStats = [
      {
        label: "Total Users",
        value: summary.users.total,
        detail: `${summary.users.active} active · ${summary.users.pendingSetup} pending setup`,
        icon: "lucide:users",
      },
      {
        label: "Active Users",
        value: summary.users.active,
        detail: `${summary.users.suspended} suspended · ${summary.users.pendingSetup} pending setup`,
        icon: "lucide:user-check",
      },
      {
        label: "Sites",
        value: summary.sites.total,
        detail: siteName ? `Currently viewing ${siteName}` : "Across this organization",
        icon: "lucide:map-pin",
      },
      {
        label: "Roles",
        value: summary.roles.total,
        detail: `${summary.roles.custom} custom · ${Math.max(0, summary.roles.total - summary.roles.custom)} built in`,
        icon: "lucide:shield-check",
      },
    ];
  }

  let moduleStats: ModuleStat[] = [];
  if (summary) {
    const moduleIds = activatedModuleCodesToIds(
      parseActivatedModuleCodes(summary.activatedModules.modules),
    );

    if (moduleIds.length === 0 && summary.activatedModules.moduleCount > 0) {
      moduleStats = [
        {
          title: "Activated Modules",
          value: summary.activatedModules.moduleCount,
          activeCount: summary.activatedModules.moduleCount,
        },
      ];
    } else {
      moduleStats = moduleIds.map((moduleId) => ({
        title: getModuleLabel(moduleId),
        value: 1,
        activeCount: 1,
      }));
    }
  }

  const activityItems: RecentActivityItem[] = activity.map((item, index) => ({
    id: `${item.type}-${item.occurredAt}-${index}`,
    actor: item.actor ?? "System",
    action: item.type.replace(/([A-Z])/g, " $1").trim(),
    target: item.description,
    time: formatRelativeTime(item.occurredAt),
  }));

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Admin Dashboard"
        description={subtitle}
        actions={
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
        }
      />

      {isLoading ? (
        <>
          <FeatureLoadingGrid
            count={4}
            label="Loading dashboard metrics…"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            cardClassName="min-h-30"
          />
          {/* Shaped like what replaces it: the wide organization panel beside
              the narrower activity column. */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <FeatureLoadingCard rows={4} label="Loading organization overview…" />
            <FeatureLoadingCard rows={5} label="Loading recent activity…" />
          </div>
        </>
      ) : null}

      {isError ? (
        <FeatureErrorCard
          title="Couldn’t load the dashboard"
          message={
            error instanceof Error
              ? error.message
              : "The dashboard summary did not load. Check your connection and try again."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && summary ? (
        <>
          <div className="stagger-cards grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                detail={stat.detail}
                icon={stat.icon}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <DetailCard
              title="Organization"
              description="Modules this organization is licensed for."
              action={
                <p className="text4 text-gray">{describeAccess(summary.access)}</p>
              }
            >
              {moduleStats.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {moduleStats.map((module) => (
                    <KpiSummaryCard
                      key={module.title}
                      title={module.title}
                      value={module.value}
                      activeCount={module.activeCount}
                    />
                  ))}
                </div>
              ) : (
                <FeatureEmptyState
                  surface={false}
                  icon="mdi:puzzle-outline"
                  title="No modules activated"
                  description="This organization has no EHS modules turned on, so most of the product is hidden from its users. CodeSwift staff activate modules from the client account."
                />
              )}
            </DetailCard>

            <RecentActivityCard
              items={activityItems}
              emptyMessage="Nothing has happened on this organization yet. User invites, access changes, and site edits show up here."
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
