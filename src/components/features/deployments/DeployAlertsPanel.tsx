"use client";

import { Icon } from "@iconify/react";
import type { DeployAlertResponse } from "@/dtos/res/platform-ops.res";
import {
  describeAlertKind,
  formatInstant,
  formatRelative,
  getUnresolvedAlerts,
} from "@/lib/deploy-status";
import {
  DeployEmptyState,
  DeployPanelLoading,
  DeploySha,
  DeployStatusPill,
} from "./DeployPills";

function AlertCard({
  alert,
  dimmed,
}: Readonly<{ alert: DeployAlertResponse; dimmed: boolean }>) {
  const pill = describeAlertKind(alert.kind);

  let cardClass =
    "rounded-3 border border-ehs-border-ink/8 bg-ehs-surface/60 p-3.5";
  if (!dimmed) {
    cardClass = "rounded-3 border border-ehs-red/20 bg-ehs-red/4 p-3.5";
  }

  return (
    <li className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <DeployStatusPill tone={pill.tone} label={pill.label} dot />
          <p className="text-ehs-darker min-w-0 text4">{alert.summary}</p>
        </div>
        <span className="text7 whitespace-nowrap text-ehs-muted-text" title={formatInstant(alert.at)}>
          {formatRelative(alert.at)}
        </span>
      </div>

      {alert.details.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {alert.details.map((detail) => (
            <li
              key={`${detail.app}-${detail.problem}-${detail.sha ?? "none"}`}
              className="flex items-center gap-2 rounded-lg bg-ehs-border-ink/4 px-2.5 py-1.5"
            >
              <span className="text-ehs-darker text7">{detail.app}</span>
              <span className="text-ehs-muted-text text7">{detail.problem}</span>
              {detail.sha ? <DeploySha sha={detail.sha} /> : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2.5 flex items-center gap-1.5 text7 text-ehs-muted-text">
        <Icon icon="lucide:send" width={11} height={11} aria-hidden />
        {alert.notified.length > 0 ? (
          <span>Notified via {alert.notified.join(", ")}</span>
        ) : (
          <span>Recorded here only — no outbound channel configured</span>
        )}
      </div>
    </li>
  );
}

export type DeployAlertsPanelProps = {
  alerts: DeployAlertResponse[];
  /** True while the alerts request is still in flight. */
  isLoading?: boolean;
};

/**
 * Alerts are written on transitions, not per cycle: one broken build produces
 * exactly one `failure` entry however long it stays broken. A short list is the
 * healthy case, and an empty one is good news rather than a loading failure.
 */
export function DeployAlertsPanel({
  alerts,
  isLoading = false,
}: Readonly<DeployAlertsPanelProps>) {
  if (isLoading) {
    return <DeployPanelLoading what="deploy alerts" />;
  }

  if (alerts.length === 0) {
    return (
      <DeployEmptyState
        icon="lucide:bell-off"
        title="No alerts"
        description="Nothing has broken since the log started. Alerts are only written when the failure state changes, so silence here is good news."
      />
    );
  }

  const live = getUnresolvedAlerts(alerts);
  const liveKeys = new Set(live.map((alert) => `${alert.at}-${alert.summary}`));
  const past = alerts.filter(
    (alert) => !liveKeys.has(`${alert.at}-${alert.summary}`),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-ehs-muted-text mb-2.5 text8 tracking-[0.66px] uppercase">
          Live problems ({live.length})
        </h3>
        {live.length === 0 ? (
          <p className="border-ehs-green/20 bg-ehs-green/6 text-ehs-green rounded-3 flex items-center gap-2 border px-4 py-3 text4">
            <Icon icon="lucide:circle-check" width={15} height={15} aria-hidden />
            Nothing broken right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {live.map((alert) => (
              <AlertCard
                key={`${alert.at}-${alert.summary}`}
                alert={alert}
                dimmed={false}
              />
            ))}
          </ul>
        )}
      </div>

      {past.length > 0 ? (
        <div className="opacity-70">
          <h3 className="text-ehs-muted-text mb-2.5 text8 tracking-[0.66px] uppercase">
            History ({past.length})
          </h3>
          <ul className="flex flex-col gap-2.5">
            {past.map((alert) => (
              <AlertCard
                key={`${alert.at}-${alert.summary}`}
                alert={alert}
                dimmed
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
