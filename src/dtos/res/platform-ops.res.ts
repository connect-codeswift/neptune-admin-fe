/**
 * Deploy status / platform ops payloads — `api/PlatformOps`.
 *
 * Read-only by design: the API only reads a snapshot the deploy timer writes to
 * disk. There are no write endpoints (no redeploy, no acknowledge) on purpose.
 */

/** Raw systemd unit state. */
export type DeployServiceState = "active" | "failed" | "inactive" | (string & {});

/** Per-app row of the snapshot. */
export type DeployAppResponse = {
  /** `backend` | `ehss-fe` | `host-fe` | `hub-fe` | `admin-fe` */
  name: string;
  sha: string;
  subject: string;
  /** ISO instant (UTC). */
  committed: string;
  unit: string;
  state: DeployServiceState;
  /** systemd-formatted string (`Fri 2026-08-07 15:56:25 GMT`) — the only non-ISO field. */
  since: string;
  port: number;
  /** HTTP status of the local health check. `0` means no answer at all. */
  health: number;
  /** Non-null: `main` moved but that commit fails to build, so it is not being shipped. */
  stuckOnFailedSha: string | null;
  /** Precomputed: active + 2xx/3xx health + nothing stuck. */
  isHealthy: boolean;
  /** Precomputed: this app is part of the cycle running right now. */
  isDeploying?: boolean;
  /** Precomputed: this app is the one being built at this moment. At most one. */
  isBuilding?: boolean;
};

/** Deploy-cycle block of the snapshot. */
export type DeployCycleResponse = {
  /** Computed live from a marker file, not from the snapshot. */
  inProgress: boolean;
  startedAt: string | null;
  /**
   * Apps this cycle is deploying. Read from the running marker, so an older
   * deploy script leaves it empty while `inProgress` is still true — empty
   * while running means *unknown*, not *none*.
   */
  apps?: string[] | null;
  /** The app being built at this moment, where the script reports that far. */
  currentApp?: string | null;
  /** systemd `Result` — `success` or `exit-code`. Non-zero can still be fine. */
  lastResult: string | null;
  lastFinished: string | null;
  timerNext: string | null;
};

/** GET /PlatformOps/deploy-status */
export type DeployStatusResponse = {
  generatedAt: string;
  host: string;
  /** Snapshot older than 10 minutes — the deploy timer itself has stopped. */
  isStale: boolean;
  ageSeconds: number;
  allHealthy: boolean;
  deploy: DeployCycleResponse;
  apps: DeployAppResponse[];
};

export type DeployEventOutcome = "deployed" | "failed" | "skipped" | (string & {});

export type DeployHistoryEventResponse = {
  app: string;
  outcome: DeployEventOutcome;
  from: string | null;
  to: string | null;
};

/** GET /PlatformOps/deploy-history — cycles that changed something, newest first. */
export type DeployHistoryEntryResponse = {
  startedAt: string;
  finishedAt: string | null;
  result: string | null;
  events: DeployHistoryEventResponse[];
};

export type DeployAlertKind =
  | "failure"
  | "recovered"
  | "service-failure"
  | (string & {});

export type DeployAlertDetailResponse = {
  app: string;
  problem: string;
  sha: string | null;
};

/** GET /PlatformOps/alerts — written on state transitions only, newest first. */
export type DeployAlertResponse = {
  at: string;
  kind: DeployAlertKind;
  summary: string;
  details: DeployAlertDetailResponse[];
  /** Outbound channels the alert reached, e.g. `["slack"]`. Empty is normal. */
  notified: string[];
  /** Precomputed: a later `recovered` supersedes this alert. Always false on `recovered`. */
  isResolved: boolean;
};
