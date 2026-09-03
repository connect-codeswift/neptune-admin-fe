"use client";

import { Icon } from "@iconify/react";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api-error";
import { getUnresolvedAlerts } from "@/lib/deploy-status";
import {
  useDeployAlerts,
  useDeployHistory,
  useDeployStatus,
} from "@/hooks/usePlatformOps";
import { DeployAlertsPanel } from "./DeployAlertsPanel";
import { DeployAppsPanel } from "./DeployAppsPanel";
import { DeployHistoryPanel } from "./DeployHistoryPanel";
import {
  DeployEmptyState,
  DeploySectionCard,
  DeployStatusPill,
} from "./DeployPills";
import { DeployStatusHero } from "./DeployStatusHero";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";

/**
 * A spinner rather than a skeleton, deliberately: this page is one snapshot
 * read, it resolves in well under a second, and a shaped placeholder for a
 * banner + meta row + table would flash. What it was missing is the
 * announcement — a screen reader had no way to know the page was still working.
 */
function LoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`${GLASS_SURFACE} flex items-center gap-2.5 px-5 py-8`}
    >
      <Icon
        icon="lucide:loader-circle"
        width={16}
        height={16}
        className="text-ehs-normal-blue animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <p className="text-ehs-muted-text text4">Reading the deploy snapshot…</p>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: Readonly<{ error: unknown; onRetry: () => void }>) {
  const isForbidden = error instanceof ApiError && error.status === 403;

  let title = "Could not read the deploy snapshot";
  let description =
    "The platform ops endpoint did not answer. Try again in a moment.";
  if (isForbidden) {
    title = "Staff access only";
    description =
      "Deploy status is restricted to CodeSwift staff accounts. A tenant admin session cannot read it.";
  } else if (error instanceof Error && error.message) {
    description = error.message;
  }

  return (
    <div className={`${GLASS_SURFACE} p-5`} role="alert">
      <DeployEmptyState
        icon="lucide:server-off"
        title={title}
        description={description}
      />
      {isForbidden ? null : (
        <div className="flex justify-center pb-4">
          <Button
            variant="secondary"
            size="sm"
            leftIcon="lucide:refresh-cw"
            onClick={onRetry}
          >
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
    <div className="border-ehs-normal-blue/25 bg-ehs-light-blue rounded-3 flex items-start gap-3 border px-4 py-3.5">
      <Icon
        icon="lucide:flask-conical"
        width={17}
        height={17}
        className="text-ehs-dark-blue mt-0.5 shrink-0"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-ehs-dark-blue text4">
          Sample data — not a real host
        </p>
        <p className="text-ehs-muted-text mt-1 text8">
          This environment does not run the deploy pipeline, so the API answered
          503. Everything below is placeholder data for layout work. Only
          production serves the real snapshot.
        </p>
      </div>
    </div>
  );
}

/** Live problems get the loud pill; nothing broken gets the quiet one. */
function AlertCountPill({ unresolved }: Readonly<{ unresolved: number }>) {
  if (unresolved === 0) {
    return <DeployStatusPill tone="ok" label="All clear" dot />;
  }

  return (
    <DeployStatusPill
      tone="danger"
      label={`${unresolved} live`}
      dot
      title="Alerts whose underlying problem has not cleared yet."
    />
  );
}

export function DeploymentsPage() {
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
      <div className="flex flex-col gap-3.5 pb-4">
        {header}
        <LoadingState />
      </div>
    );
  }

  if (statusQuery.isError || !status) {
    return (
      <div className="flex flex-col gap-3.5 pb-4">
        {header}
        <ErrorState error={statusQuery.error} onRetry={refreshAll} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 pb-4">
      {header}

      <DeployStatusHero status={status} />

      {/*
        Apps first and full width: it is a five-column table whose richest
        column is the running commit, and boxed into half the page that column
        is the one that loses. History and alerts are lists of short lines, so
        they pair below on the house 8/5 split — the log of what shipped beside
        the log of what broke, both visible at once instead of hidden behind
        tabs that made you click to find out whether anything was wrong.
      */}
      <DeploySectionCard
        title="Apps on this host"
        description="What each systemd unit is currently running, and whether it is answering."
        action={
          <DeployStatusPill
            tone="muted"
            label={`${status.apps.length} app${status.apps.length === 1 ? "" : "s"}`}
          />
        }
      >
        <DeployAppsPanel apps={status.apps} />
      </DeploySectionCard>

      <div className="stagger-cards grid gap-3.5 xl:grid-cols-13">
        <DeploySectionCard
          title="Recent deploy cycles"
          description="Only cycles that changed something are recorded, newest first."
          className="h-full xl:col-span-8"
        >
          <DeployHistoryPanel
            history={history}
            isLoading={historyQuery.isPending}
          />
        </DeploySectionCard>

        <DeploySectionCard
          title="Deploy alerts"
          description="Written when the failure state changes — one entry per broken build, not one per cycle."
          className="h-full xl:col-span-5"
          action={<AlertCountPill unresolved={unresolvedCount} />}
        >
          <DeployAlertsPanel alerts={alerts} isLoading={alertsQuery.isPending} />
        </DeploySectionCard>
      </div>

      <p className="text-ehs-muted-text flex items-start gap-2 px-1 text8">
        <Icon
          icon="lucide:info"
          width={13}
          height={13}
          className="mt-px shrink-0"
          aria-hidden
        />
        Read-only by design. Deploys are driven by merging to <code>main</code>{" "}
        and alerts clear themselves when the underlying problem does, so there is
        no redeploy or acknowledge action here.
      </p>
    </div>
  );
}
