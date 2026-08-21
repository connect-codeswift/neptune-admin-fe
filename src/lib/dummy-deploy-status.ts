import type {
  DeployAlertResponse,
  DeployHistoryEntryResponse,
  DeployStatusResponse,
} from "@/dtos/res/platform-ops.res";

/**
 * Sample deploy snapshot, shown **only** when the API answers 503 (every
 * environment except production). Always rendered behind a visible "Sample
 * data" ribbon so it can never be mistaken for the real host.
 *
 * Timestamps are generated relative to now, otherwise the relative-time labels
 * read "3 years ago" and the panel looks broken. The scenario deliberately
 * exercises the states that are hard to reach on purpose: a deploy running, an
 * app stuck on a failing build, and a mix of resolved/unresolved alerts.
 */

function isoAgo(secondsAgo: number): string {
  return new Date(Date.now() - secondsAgo * 1000).toISOString();
}

function isoAhead(secondsAhead: number): string {
  return new Date(Date.now() + secondsAhead * 1000).toISOString();
}

/** systemd's `since` format — not ISO, same as the real payload. */
function systemdSince(secondsAgo: number): string {
  const date = new Date(Date.now() - secondsAgo * 1000);
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("weekday")} ${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} GMT`;
}

export function getDummyDeployStatus(): DeployStatusResponse {
  return {
    generatedAt: isoAgo(34),
    host: "neptune-app-02",
    isStale: false,
    ageSeconds: 34.2,
    allHealthy: false,
    deploy: {
      inProgress: true,
      startedAt: isoAgo(134),
      // Two apps in the cycle, one of them mid-build: the case the panel now
      // has to render, and one you cannot reach outside production.
      apps: ["admin-fe", "hub-fe"],
      currentApp: "admin-fe",
      lastResult: "exit-code",
      lastFinished: isoAgo(160),
      timerNext: isoAhead(86),
    },
    apps: [
      {
        name: "backend",
        sha: "297cfba",
        subject: "Staging (#200)",
        committed: isoAgo(3_540),
        unit: "neptune-backend",
        state: "active",
        since: systemdSince(1_820),
        port: 5000,
        health: 200,
        stuckOnFailedSha: null,
        isHealthy: true,
      },
      {
        name: "ehss-fe",
        sha: "296159f",
        subject: "Fix incident export column widths (#198)",
        committed: isoAgo(9_100),
        unit: "neptune-ehss-fe",
        state: "active",
        since: systemdSince(9_000),
        port: 3000,
        health: 200,
        stuckOnFailedSha: "237b90b",
        isHealthy: false,
      },
      {
        name: "host-fe",
        sha: "41ba0d2",
        subject: "Marketing copy pass (#96)",
        committed: isoAgo(52_000),
        unit: "neptune-host-fe",
        state: "active",
        since: systemdSince(51_800),
        port: 3001,
        health: 200,
        stuckOnFailedSha: null,
        isHealthy: true,
      },
      {
        name: "hub-fe",
        sha: "b0c7e14",
        subject: "Contractor induction wizard (#142)",
        committed: isoAgo(140_000),
        unit: "neptune-hub-fe",
        state: "inactive",
        since: systemdSince(600),
        port: 3002,
        health: 0,
        stuckOnFailedSha: null,
        isHealthy: false,
        isDeploying: true,
      },
      {
        name: "admin-fe",
        sha: "8c5ea3f",
        subject: "Multi-site selection for user management (#203)",
        committed: isoAgo(7_200),
        unit: "neptune-admin-fe",
        state: "active",
        since: systemdSince(7_050),
        port: 3003,
        health: 200,
        stuckOnFailedSha: null,
        isHealthy: true,
        isDeploying: true,
        isBuilding: true,
      },
    ],
  };
}

export function getDummyDeployHistory(): DeployHistoryEntryResponse[] {
  return [
    {
      startedAt: isoAgo(1_960),
      finishedAt: isoAgo(1_834),
      result: "ok",
      events: [
        { app: "backend", outcome: "deployed", from: "296159f", to: "297cfba" },
        { app: "ehss-fe", outcome: "skipped", from: "296159f", to: "237b90b" },
      ],
    },
    {
      startedAt: isoAgo(9_260),
      finishedAt: isoAgo(9_048),
      result: "exit-code",
      events: [
        { app: "ehss-fe", outcome: "failed", from: "296159f", to: "237b90b" },
      ],
    },
    {
      startedAt: isoAgo(7_400),
      finishedAt: isoAgo(7_155),
      result: "ok",
      events: [
        { app: "admin-fe", outcome: "deployed", from: "376f6e7", to: "8c5ea3f" },
      ],
    },
    {
      startedAt: isoAgo(52_400),
      finishedAt: isoAgo(52_160),
      result: "ok",
      events: [
        { app: "host-fe", outcome: "deployed", from: "0431d80", to: "41ba0d2" },
        { app: "hub-fe", outcome: "deployed", from: "79b2048", to: "b0c7e14" },
      ],
    },
  ];
}

export function getDummyDeployAlerts(): DeployAlertResponse[] {
  return [
    {
      at: isoAgo(9_040),
      kind: "failure",
      summary: "ehss-fe build failing on 237b90b",
      details: [{ app: "ehss-fe", problem: "build-failing", sha: "237b90b" }],
      notified: [],
      isResolved: false,
    },
    {
      at: isoAgo(620),
      kind: "failure",
      summary: "hub-fe service is not active",
      details: [{ app: "hub-fe", problem: "unit-inactive", sha: null }],
      notified: ["slack"],
      isResolved: false,
    },
    {
      at: isoAgo(51_900),
      kind: "recovered",
      summary: "All apps healthy again",
      details: [],
      notified: ["slack"],
      isResolved: false,
    },
    {
      at: isoAgo(53_400),
      kind: "failure",
      summary: "host-fe build failing on 0431d80",
      details: [{ app: "host-fe", problem: "build-failing", sha: "0431d80" }],
      notified: ["slack"],
      isResolved: true,
    },
  ];
}
