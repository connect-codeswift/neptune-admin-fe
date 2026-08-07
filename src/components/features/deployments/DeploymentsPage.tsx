"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { PageHeader } from "@/components/layouts";
import { Button, TabBar } from "@/components/ui";
import { ApiError } from "@/lib/api-error";
import {
  formatElapsed,
  formatInstant,
  formatRelative,
  formatRelativeOrRaw,
  getUnresolvedAlerts,
} from "@/lib/deploy-status";
import {
  useDeployAlerts,
  useDeployHistory,
  useDeployStatus,
} from "@/hooks/usePlatformOps";
import { DeployAlertsPanel } from "./DeployAlertsPanel";
import { DeployAppsPanel } from "./DeployAppsPanel";
import { DeployHistoryPanel } from "./DeployHistoryPanel";
import { DeployEmptyState, DeploySectionCard } from "./DeployPills";
import {
  DeployInProgressStrip,
  DeployStatusBanner,
} from "./DeployStatusBanner";

const TAB_APPS = 0;
const TAB_HISTORY = 1;
const TAB_ALERTS = 2;

function MetaChip({
  label,
  value,
  title,
}: Readonly<{ label: string; value: string; title?: string }>) {
  return (
    <div className="min-w-0" title={title}>
      <p className="text8 tracking-[0.66px] text-[#8892a3] uppercase">{label}</p>
      <p className="mt-1 truncate text5 text-darkest">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2.5 rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 shadow-lg backdrop-blur-[10px]">
      <Icon
        icon="lucide:loader-circle"
        width={16}
        height={16}
        className="animate-spin text-blue-normal"
        aria-hidden
      />
      <p className="text5 text-gray">Reading the deploy snapshot…</p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: Readonly<{ error: unknown; onRetry: () => void }>) {
  const isForbidden = error instanceof ApiError && error.status === 403;

  let title = "Could not read the deploy snapshot";
  let description = "The platform ops endpoint did not answer. Try again in a moment.";
  if (isForbidden) {
    title = "Staff access only";
    description =
      "Deploy status is restricted to CodeSwift staff accounts. A tenant admin session cannot read it.";
  } else if (error instanceof Error && error.message) {
    description = error.message;
  }

  return (
    <div className="rounded-[20px] border border-white/90 bg-white/62 p-5 shadow-lg backdrop-blur-[10px]">
      <DeployEmptyState
        icon="lucide:server-off"
        title={title}
        description={description}
      />
      {isForbidden ? null : (
        <div className="flex justify-center pb-4">
          <Button variant="secondary" size="sm" leftIcon="lucide:refresh-cw" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Sample data is loud on purpose. A panel whose whole job is telling you what is
 * really running must never be mistakable for the real host.
 */
function SampleDataNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-normal/25 bg-blue-lightest px-4 py-3.5">
      <Icon
        icon="lucide:flask-conical"
        width={17}
        height={17}
        className="mt-0.5 shrink-0 text-blue-deep"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text4 text-blue-deep">Sample data — not a real host</p>
        <p className="mt-1 text6 text-gray">
          This environment does not run the deploy pipeline, so the API answered 503.
          Everything below is placeholder data for layout work. Only production
          serves the real snapshot.
        </p>
      </div>
    </div>
  );
}

export function DeploymentsPage() {
  const [activeTab, setActiveTab] = useState(TAB_APPS);

  const statusQuery = useDeployStatus();
  const historyQuery = useDeployHistory();
  const alertsQuery = useDeployAlerts();

  const status = statusQuery.data?.data;
  const history = historyQuery.data?.data ?? [];
  const alerts = alertsQuery.data?.data ?? [];
  const isSample = statusQuery.data?.isSample === true;
  const unresolvedCount = getUnresolvedAlerts(alerts).length;

  const refreshAll = () => {
    void statusQuery.refetch();
    void historyQuery.refetch();
    void alertsQuery.refetch();
  };

  const header = (
    <PageHeader
      title="Deployments"
      description="What is actually running on the production app host — commit, service state, health, and what is holding a deploy back."
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon="lucide:refresh-cw"
          onClick={refreshAll}
          loading={statusQuery.isFetching}
          loadingText="Refreshing"
        >
          Refresh
        </Button>
      }
    />
  );

  if (statusQuery.isPending) {
    return (
      <div className="flex flex-col gap-6 pb-4">
        {header}
        <LoadingState />
      </div>
    );
  }

  if (statusQuery.isError || !status) {
    return (
      <div className="flex flex-col gap-6 pb-4">
        {header}
        <ErrorState error={statusQuery.error} onRetry={refreshAll} />
      </div>
    );
  }

  const tabs = [
    { id: "apps", label: `Apps (${status.apps.length})` },
    { id: "history", label: "Deploy history" },
    { id: "alerts", label: "Alerts", badge: unresolvedCount },
  ];

  return (
    <div className="flex flex-col gap-6 pb-4">
      {header}

      {isSample ? <SampleDataNotice /> : null}

      <DeployStatusBanner status={status} />

      {status.deploy.inProgress ? (
        <DeployInProgressStrip startedAt={status.deploy.startedAt} />
      ) : null}

      <div className="grid grid-cols-2 gap-4 rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px] sm:grid-cols-3 xl:grid-cols-5">
        <MetaChip label="Host" value={status.host || "—"} />
        <MetaChip
          label="Snapshot age"
          value={formatElapsed(status.ageSeconds)}
          title={`Written ${formatInstant(status.generatedAt)}`}
        />
        <MetaChip
          label="Next check"
          value={formatRelativeOrRaw(status.deploy.timerNext)}
          title="The timer polls main every 2 minutes."
        />
        <MetaChip
          label="Last cycle"
          value={formatRelative(status.deploy.lastFinished)}
          title={formatInstant(status.deploy.lastFinished)}
        />
        <MetaChip
          label="Cycle result"
          value={status.deploy.lastResult || "—"}
          title="systemd Result. A cycle that skipped an app for a failing build exits non-zero on purpose, so exit-code is not automatically bad — judge by the stuck line on the app row."
        />
      </div>

      <div>
        <TabBar
          tabs={tabs}
          activeIndex={activeTab}
          onChange={setActiveTab}
          label="Deployment sections"
        />

        <div className="pt-5">
          {activeTab === TAB_APPS ? (
            <DeployAppsPanel apps={status.apps} />
          ) : null}

          {activeTab === TAB_HISTORY ? (
            <DeploySectionCard
              title="Recent deploy cycles"
              description="Only cycles that changed something are recorded, newest first."
            >
              <DeployHistoryPanel history={history} />
            </DeploySectionCard>
          ) : null}

          {activeTab === TAB_ALERTS ? (
            <DeploySectionCard
              title="Deploy alerts"
              description="Written when the failure state changes — one entry per broken build, not one per cycle."
            >
              <DeployAlertsPanel alerts={alerts} />
            </DeploySectionCard>
          ) : null}
        </div>
      </div>

      <p className="flex items-start gap-2 px-1 text7 text-[#8892a3]">
        <Icon icon="lucide:info" width={13} height={13} className="mt-px shrink-0" aria-hidden />
        Read-only by design. Deploys are driven by merging to <code>main</code> and
        alerts clear themselves when the underlying problem does, so there is no
        redeploy or acknowledge action here.
      </p>
    </div>
  );
}
