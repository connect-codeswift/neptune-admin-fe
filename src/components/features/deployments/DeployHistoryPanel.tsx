"use client";

import type {
  DeployHistoryEntryResponse,
  DeployHistoryEventResponse,
} from "@/dtos/res/platform-ops.res";
import type { DeployTone } from "@/lib/deploy-status";
import {
  describeOutcome,
  formatDuration,
  formatInstant,
  formatRelative,
  getOutcomeHint,
} from "@/lib/deploy-status";
import {
  DeployEmptyState,
  DeployPanelLoading,
  DeployShaTransition,
  DeployStatusPill,
} from "./DeployPills";

const CYCLE_BAR: Record<DeployTone, string> = {
  ok: "bg-ehs-green",
  warn: "bg-ehs-yellow",
  danger: "bg-ehs-red",
  muted: "bg-ehs-border-ink/20",
};

/** Worst outcome in the cycle wins — a rollback matters more than a success next to it. */
function getCycleTone(events: DeployHistoryEventResponse[]): DeployTone {
  if (events.some((event) => event.outcome === "failed")) return "danger";
  if (events.some((event) => event.outcome === "skipped")) return "warn";
  if (events.some((event) => event.outcome === "deployed")) return "ok";
  return "muted";
}

function getCycleLabel(events: DeployHistoryEventResponse[]): string {
  const deployed = events.filter((event) => event.outcome === "deployed").length;
  const failed = events.filter((event) => event.outcome === "failed").length;
  const skipped = events.filter((event) => event.outcome === "skipped").length;

  const parts: string[] = [];
  if (deployed > 0) parts.push(`${deployed} deployed`);
  if (failed > 0) parts.push(`${failed} failed`);
  if (skipped > 0) parts.push(`${skipped} skipped`);
  if (parts.length === 0) return "No changes";
  return parts.join(" · ");
}

function EventRow({ event }: Readonly<{ event: DeployHistoryEventResponse }>) {
  const pill = describeOutcome(event.outcome);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-ehs-border-ink/6 py-2.5 first:border-t-0">
      <span className="text-ehs-darker w-24 shrink-0 text4">{event.app}</span>
      <DeployStatusPill
        tone={pill.tone}
        label={pill.label}
        title={getOutcomeHint(event.outcome)}
      />
      <DeployShaTransition from={event.from} to={event.to} />
    </li>
  );
}

function CycleCard({ cycle }: Readonly<{ cycle: DeployHistoryEntryResponse }>) {
  const tone = getCycleTone(cycle.events);

  return (
    <li className="border-ehs-border-ink/8 bg-ehs-surface/60 rounded-3 flex overflow-hidden border">
      <span className={`w-1 shrink-0 ${CYCLE_BAR[tone]}`} aria-hidden />
      <div className="min-w-0 flex-1 p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <DeployStatusPill tone={tone} label={getCycleLabel(cycle.events)} dot />
            <span className="text-ehs-muted-text text8">
              {formatInstant(cycle.startedAt)} → {formatInstant(cycle.finishedAt)}
            </span>
          </div>
          <span className="text7 text-ehs-muted-text">
            {formatDuration(cycle.startedAt, cycle.finishedAt)} ·{" "}
            {formatRelative(cycle.finishedAt ?? cycle.startedAt)}
          </span>
        </div>

        <ul className="mt-2.5">
          {cycle.events.map((event) => (
            <EventRow key={`${event.app}-${event.to ?? event.from}`} event={event} />
          ))}
        </ul>
      </div>
    </li>
  );
}

export type DeployHistoryPanelProps = {
  history: DeployHistoryEntryResponse[];
  /** True while the history request is still in flight. */
  isLoading?: boolean;
};

export function DeployHistoryPanel({
  history,
  isLoading = false,
}: Readonly<DeployHistoryPanelProps>) {
  if (isLoading) {
    return <DeployPanelLoading what="deploy history" />;
  }

  if (history.length === 0) {
    return (
      <DeployEmptyState
        icon="lucide:git-commit-horizontal"
        title="No deploys yet"
        description="Cycles where every app was already up to date are not recorded, so an empty list means nothing has shipped recently."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {history.map((cycle) => (
        <CycleCard key={cycle.startedAt} cycle={cycle} />
      ))}
    </ul>
  );
}
