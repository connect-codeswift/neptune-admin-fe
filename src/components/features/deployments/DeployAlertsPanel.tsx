"use client";

import { Icon } from "@iconify/react";
import type { DeployAlertResponse } from "@/dtos/res/platform-ops.res";
import {
  describeAlertKind,
  formatInstant,
  formatRelative,
  getUnresolvedAlerts,
} from "@/lib/deploy-status";
import { DeployEmptyState, DeploySha, DeployStatusPill } from "./DeployPills";

function AlertCard({
  alert,
  dimmed,
}: Readonly<{ alert: DeployAlertResponse; dimmed: boolean }>) {
  const pill = describeAlertKind(alert.kind);

  let cardClass = "rounded-2xl border border-darkest/8 bg-white p-4";
  if (!dimmed) {
    cardClass = "rounded-2xl border border-red/20 bg-red/4 p-4";
  }

  return (
    <li className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <DeployStatusPill tone={pill.tone} label={pill.label} dot />
          <p className="min-w-0 text5 text-darkest">{alert.summary}</p>
        </div>
        <span className="text7 whitespace-nowrap text-[#8892a3]" title={formatInstant(alert.at)}>
          {formatRelative(alert.at)}
        </span>
      </div>

      {alert.details.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {alert.details.map((detail) => (
            <li
              key={`${detail.app}-${detail.problem}-${detail.sha ?? "none"}`}
              className="flex items-center gap-2 rounded-lg bg-darkest/4 px-2.5 py-1.5"
            >
              <span className="text7 font-semibold text-darkest">{detail.app}</span>
              <span className="text7 text-gray">{detail.problem}</span>
              {detail.sha ? <DeploySha sha={detail.sha} /> : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2.5 flex items-center gap-1.5 text7 text-[#8892a3]">
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
};

/**
 * Alerts are written on transitions, not per cycle: one broken build produces
 * exactly one `failure` entry however long it stays broken. A short list is the
 * healthy case, and an empty one is good news rather than a loading failure.
 */
export function DeployAlertsPanel({ alerts }: Readonly<DeployAlertsPanelProps>) {
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
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text8 tracking-[0.66px] text-[#8892a3] uppercase">
          Live problems ({live.length})
        </p>
        {live.length === 0 ? (
          <p className="flex items-center gap-2 rounded-2xl border border-green/20 bg-green/6 px-4 py-3 text5 text-green">
            <Icon icon="lucide:circle-check" width={15} height={15} aria-hidden />
            Nothing broken right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
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
          <p className="mb-2.5 text8 tracking-[0.66px] text-[#8892a3] uppercase">
            History ({past.length})
          </p>
          <ul className="flex flex-col gap-3">
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
