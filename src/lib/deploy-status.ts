import { ApiError } from "@/lib/api-error";
import type {
  DeployAlertResponse,
  DeployAppResponse,
  DeployEventOutcome,
  DeployServiceState,
} from "@/dtos/res/platform-ops.res";

/**
 * Formatting + interpretation helpers for the deploy status panel.
 *
 * The snapshot behind these endpoints only changes every 2 minutes, so polling
 * faster than ~15s is wasted work — including while a deploy is in progress.
 */
export const DEPLOY_STATUS_POLL_MS = 20_000;
export const DEPLOY_ALERTS_POLL_MS = 30_000;
export const DEPLOY_HISTORY_POLL_MS = 60_000;

/** The snapshot is considered stale by the API after 10 minutes. */
export const DEPLOY_STALE_AFTER_SECONDS = 600;

export type DeployTone = "ok" | "warn" | "danger" | "muted";

/**
 * 503 means *this environment does not run the deploy pipeline* — the expected
 * answer on local and on Coolify staging. It is not a failure to shout about.
 */
export function isDeployPipelineAbsent(error: unknown): boolean {
  return error instanceof ApiError && error.status === 503;
}

/* —— Time —— */

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** `Aug 7, 17:03:52` in the viewer's zone. */
export function formatInstant(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/** `17:03:52` in the viewer's zone. */
export function formatClock(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.35],
  ["month", 12],
  ["year", Number.POSITIVE_INFINITY],
];

/** `2 minutes ago` / `in 1 minute`. */
export function formatRelative(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  let delta = (date.getTime() - Date.now()) / 1000;

  for (const [unit, step] of RELATIVE_UNITS) {
    if (Math.abs(delta) < step || step === Number.POSITIVE_INFINITY) {
      return formatter.format(Math.round(delta), unit);
    }
    delta /= step;
  }

  return formatter.format(Math.round(delta), "year");
}

/**
 * `timerNext` is not documented as ISO the way the other instants are, so an
 * unparseable value is shown verbatim rather than swallowed as `—`.
 */
export function formatRelativeOrRaw(value: string | null | undefined): string {
  if (!value) return "—";
  const relative = formatRelative(value);
  if (relative !== "—") return relative;
  return value;
}

/** `03m 34s` — the shape Coolify uses for deploy durations. */
export function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) return `${hours}h ${mm}m ${ss}s`;
  return `${mm}m ${ss}s`;
}

/** Duration between two instants, or `—` when either is missing. */
export function formatDuration(
  startedAt: string | null | undefined,
  finishedAt: string | null | undefined,
): string {
  const start = toDate(startedAt);
  const end = toDate(finishedAt);
  if (!start || !end) return "—";
  return formatElapsed((end.getTime() - start.getTime()) / 1000);
}

/** Seconds elapsed since an instant, for live "running for" counters. */
export function secondsSince(value: string | null | undefined): number | null {
  const date = toDate(value);
  if (!date) return null;
  return Math.max(0, (Date.now() - date.getTime()) / 1000);
}

/* —— Interpretation —— */

export type DeployPill = {
  label: string;
  tone: DeployTone;
};

/**
 * `0` is not a status code — it means the health check got no answer at all
 * (connection refused), which is worse than a 500.
 */
export function describeHealth(health: number): DeployPill {
  if (health === 0) return { label: "No answer", tone: "danger" };
  if (health >= 200 && health < 400) return { label: `${health} OK`, tone: "ok" };
  if (health >= 400 && health < 500) return { label: String(health), tone: "warn" };
  return { label: String(health), tone: "danger" };
}

export function describeServiceState(state: DeployServiceState): DeployPill {
  if (state === "active") return { label: "Active", tone: "ok" };
  if (state === "failed") return { label: "Failed", tone: "danger" };
  if (state === "inactive") return { label: "Inactive", tone: "warn" };
  return { label: state || "Unknown", tone: "muted" };
}

const OUTCOME_PILL: Record<string, DeployPill> = {
  deployed: { label: "Deployed", tone: "ok" },
  failed: { label: "Failed", tone: "danger" },
  skipped: { label: "Skipped", tone: "warn" },
};

export function describeOutcome(outcome: DeployEventOutcome): DeployPill {
  return OUTCOME_PILL[outcome] ?? { label: String(outcome), tone: "muted" };
}

const OUTCOME_HINT: Record<string, string> = {
  deployed: "Built, migrated, restarted, health check passed.",
  failed: "Build or health check failed — rolled back, still serving the old SHA.",
  skipped: "Held back by an earlier failure on the same commit. Not retried on purpose.",
};

export function getOutcomeHint(outcome: DeployEventOutcome): string | undefined {
  return OUTCOME_HINT[outcome];
}

const ALERT_PILL: Record<string, DeployPill> = {
  failure: { label: "Failure", tone: "danger" },
  recovered: { label: "Recovered", tone: "ok" },
  "service-failure": { label: "Service failure", tone: "danger" },
};

export function describeAlertKind(kind: string): DeployPill {
  return ALERT_PILL[kind] ?? { label: kind, tone: "muted" };
}

/** Live problems only — a `recovered` entry is never itself a problem. */
export function getUnresolvedAlerts(
  alerts: DeployAlertResponse[],
): DeployAlertResponse[] {
  return alerts.filter((alert) => !alert.isResolved && alert.kind !== "recovered");
}

export function getStuckApps(apps: DeployAppResponse[]): DeployAppResponse[] {
  return apps.filter((app) => Boolean(app.stuckOnFailedSha));
}

export function getUnhealthyApps(apps: DeployAppResponse[]): DeployAppResponse[] {
  return apps.filter((app) => !app.isHealthy);
}

export function shortenSha(sha: string | null | undefined, length = 7): string {
  if (!sha) return "—";
  return sha.slice(0, length);
}
