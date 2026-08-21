"use client";

import { Icon } from "@iconify/react";
import type { DeployAppResponse } from "@/dtos/res/platform-ops.res";
import { Table, type TableColumn } from "@/components/ui";
import {
  describeHealth,
  describeServiceState,
  formatRelative,
} from "@/lib/deploy-status";
import { DeploySha, DeployStatusPill } from "./DeployPills";

/**
 * The pulsing dot marks the row a deploy is touching right now, so the answer
 * to "which app is building" is on the app itself rather than only in the
 * page-level strip. `isBuilding` is the app being built at this moment;
 * `isDeploying` is the wider set in the same cycle, which is all an older
 * deploy script reports.
 */
function AppNameCell({ app }: Readonly<{ app: DeployAppResponse }>) {
  let deployLabel: string | null = null;
  if (app.isBuilding) {
    deployLabel = "Building now";
  } else if (app.isDeploying) {
    deployLabel = "In this deploy";
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-1.5">
        {deployLabel ? (
          <span className="relative flex size-2 shrink-0" aria-hidden>
            <span className="bg-ehs-normal-blue/70 absolute inline-flex size-full rounded-full motion-safe:animate-ping" />
            <span className="bg-ehs-normal-blue relative inline-flex size-2 rounded-full" />
          </span>
        ) : null}
        <p className="text-ehs-darker truncate text5">{app.name}</p>
      </div>
      {deployLabel ? (
        <p className="text-ehs-normal-blue truncate text7">{deployLabel}</p>
      ) : (
        <p className="truncate text7 text-ehs-muted-text">
          {app.unit} · :{app.port}
        </p>
      )}
    </div>
  );
}

function CommitCell({ app }: Readonly<{ app: DeployAppResponse }>) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <DeploySha sha={app.sha} />
        <span className="text-ehs-muted-text truncate text8">{app.subject}</span>
      </div>
      <p className="mt-1 truncate text7 text-ehs-muted-text">
        Committed {formatRelative(app.committed)}
      </p>
      {app.stuckOnFailedSha ? (
        <p className="text-ehs-red mt-1.5 flex items-center gap-1.5 text7">
          <Icon icon="lucide:octagon-alert" width={12} height={12} aria-hidden />
          build failing on {app.stuckOnFailedSha} — not retrying
        </p>
      ) : null}
    </div>
  );
}

function ServiceCell({ app }: Readonly<{ app: DeployAppResponse }>) {
  const pill = describeServiceState(app.state);
  return <DeployStatusPill tone={pill.tone} label={pill.label} dot />;
}

function HealthCell({ app }: Readonly<{ app: DeployAppResponse }>) {
  const pill = describeHealth(app.health);
  let title = `Health check returned ${app.health}`;
  if (app.health === 0) {
    title = "Health check got no answer at all (connection refused)";
  }
  return <DeployStatusPill tone={pill.tone} label={pill.label} title={title} />;
}

/** `since` is systemd-formatted, not ISO — rendered exactly as the host wrote it. */
function SinceCell({ app }: Readonly<{ app: DeployAppResponse }>) {
  return <span className="text-ehs-muted-text text8 whitespace-nowrap">{app.since || "—"}</span>;
}

const APP_COLUMNS: TableColumn<DeployAppResponse>[] = [
  {
    id: "app",
    header: "App",
    cell: (app) => <AppNameCell app={app} />,
    className: "w-52",
  },
  {
    id: "commit",
    header: "Running commit",
    cell: (app) => <CommitCell app={app} />,
  },
  {
    id: "service",
    header: "Service",
    cell: (app) => <ServiceCell app={app} />,
    className: "w-32",
  },
  {
    id: "health",
    header: "Health",
    cell: (app) => <HealthCell app={app} />,
    className: "w-32",
  },
  {
    id: "since",
    header: "Up since",
    cell: (app) => <SinceCell app={app} />,
    className: "w-56",
  },
];

export type DeployAppsPanelProps = {
  apps: DeployAppResponse[];
};

export function DeployAppsPanel({ apps }: Readonly<DeployAppsPanelProps>) {
  return (
    <Table
      columns={APP_COLUMNS}
      data={apps}
      getRowId={(app) => app.name}
      emptyMessage="The snapshot lists no apps."
    />
  );
}
