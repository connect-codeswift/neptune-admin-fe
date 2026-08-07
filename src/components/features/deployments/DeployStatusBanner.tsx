"use client";

import { Icon } from "@iconify/react";
import { useSyncExternalStore } from "react";
import type { DeployStatusResponse } from "@/dtos/res/platform-ops.res";
import {
  formatElapsed,
  formatInstant,
  formatRelative,
  getStuckApps,
  getUnhealthyApps,
  secondsSince,
} from "@/lib/deploy-status";

type BannerTone = "ok" | "warn" | "danger";

type Banner = {
  tone: BannerTone;
  icon: string;
  title: string;
  detail: string;
};

const BANNER_CLASS: Record<BannerTone, string> = {
  ok: "border-green/25 bg-green/8 text-green",
  warn: "border-yellow/35 bg-yellow/12 text-yellow",
  danger: "border-red/25 bg-red/8 text-red",
};

function joinAppNames(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * A stale page is the dangerous failure mode: if the deploy timer dies the API
 * keeps serving the last snapshot forever, so every other number here is frozen
 * history. That state outranks everything below it.
 */
function getBanner(status: DeployStatusResponse): Banner {
  if (status.isStale) {
    return {
      tone: "warn",
      icon: "lucide:alert-triangle",
      title: "Snapshot is stale — the deploy timer may have stopped",
      detail: `Last written ${formatRelative(status.generatedAt)}. Everything below is frozen history, not live state.`,
    };
  }

  const stuck = getStuckApps(status.apps);
  if (stuck.length > 0) {
    return {
      tone: "danger",
      icon: "lucide:octagon-alert",
      title: `Deploy is stuck on ${joinAppNames(stuck.map((app) => app.name))}`,
      detail: "main has moved but the commit fails to build, so it is deliberately not being shipped.",
    };
  }

  const unhealthy = getUnhealthyApps(status.apps);
  if (unhealthy.length > 0) {
    return {
      tone: "danger",
      icon: "lucide:circle-x",
      title: `${joinAppNames(unhealthy.map((app) => app.name))} ${unhealthy.length === 1 ? "is" : "are"} unhealthy`,
      detail: "The service is not active or its health check is not answering.",
    };
  }

  return {
    tone: "ok",
    icon: "lucide:circle-check",
    title: "All apps deployed and healthy",
    detail: `Every app is on main and answering. Snapshot written ${formatRelative(status.generatedAt)}.`,
  };
}

export type DeployStatusBannerProps = {
  status: DeployStatusResponse;
};

export function DeployStatusBanner({ status }: Readonly<DeployStatusBannerProps>) {
  const banner = getBanner(status);

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${BANNER_CLASS[banner.tone]}`}
      role={banner.tone === "ok" ? undefined : "alert"}
    >
      <Icon icon={banner.icon} width={18} height={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text4">{banner.title}</p>
        <p className="mt-1 text6 opacity-85">{banner.detail}</p>
      </div>
    </div>
  );
}

export type DeployInProgressStripProps = {
  startedAt: string | null;
};

/** Wall clock as an external store, so the counter ticks without setState churn. */
function subscribeToSecond(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}

function getSecondSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

/** No clock on the server — the counter appears after hydration. */
function getServerSecondSnapshot(): number {
  return 0;
}

/**
 * The thing people watch after merging. The counter ticks locally; the snapshot
 * itself will not update mid-cycle, so there is nothing to gain from polling
 * faster while this is on screen.
 */
export function DeployInProgressStrip({
  startedAt,
}: Readonly<DeployInProgressStripProps>) {
  const tick = useSyncExternalStore(
    subscribeToSecond,
    getSecondSnapshot,
    getServerSecondSnapshot,
  );

  let elapsed: number | null = null;
  if (tick > 0) {
    elapsed = secondsSince(startedAt);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-normal/25 bg-blue-normal/8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
        <span className="relative flex size-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full rounded-full bg-blue-normal/70 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-blue-normal" />
        </span>
        <p className="text4 text-blue-deep">Deploy running</p>
        <p className="text6 text-gray">
          Started {formatInstant(startedAt)}
          {elapsed === null ? null : ` · ${formatElapsed(elapsed)} elapsed`}
        </p>
      </div>
      <div className="h-0.5 w-full overflow-hidden bg-blue-normal/15">
        <div className="h-full w-full rounded-full bg-blue-normal motion-safe:w-1/3 motion-safe:animate-[deploy-sweep_1.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
