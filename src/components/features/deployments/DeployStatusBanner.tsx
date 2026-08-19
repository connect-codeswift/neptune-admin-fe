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
  ok: "border-ehs-green/25 bg-ehs-green/8 text-ehs-green",
  warn: "border-ehs-yellow/35 bg-ehs-yellow/12 text-ehs-yellow",
  danger: "border-ehs-red/25 bg-ehs-red/8 text-ehs-red",
};

/** The icon plate. Inherits the tone ink from the banner; only the fill differs. */
const BANNER_ICON_CLASS: Record<BannerTone, string> = {
  ok: "bg-ehs-green/14",
  warn: "bg-ehs-yellow/16",
  danger: "bg-ehs-red/14",
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
    // The hero of the page: the one line that answers "is anything on fire".
    // It reads at arm's length now — plated icon, section-title type — instead
    // of as one more tinted strip among the notices around it.
    <div
      className={`flex items-start gap-3.5 rounded-4 border px-4.5 py-4 ${BANNER_CLASS[banner.tone]}`}
      role={banner.tone === "ok" ? undefined : "alert"}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-3 ${BANNER_ICON_CLASS[banner.tone]}`}
      >
        <Icon icon={banner.icon} width={22} height={22} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2 className="text3">{banner.title}</h2>
        <p className="mt-1 text8 opacity-85">{banner.detail}</p>
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
    <div className="border-ehs-normal-blue/25 bg-ehs-normal-blue/8 rounded-3 overflow-hidden border">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
        <span className="relative flex size-2 shrink-0" aria-hidden>
          <span className="bg-ehs-normal-blue/70 absolute inline-flex size-full rounded-full motion-safe:animate-ping" />
          <span className="bg-ehs-normal-blue relative inline-flex size-2 rounded-full" />
        </span>
        <p className="text-ehs-dark-blue text5">Deploy running</p>
        <p className="text-ehs-muted-text text8">
          Started {formatInstant(startedAt)}
          {elapsed === null ? null : ` · ${formatElapsed(elapsed)} elapsed`}
        </p>
      </div>
      <div className="bg-ehs-normal-blue/15 h-0.5 w-full overflow-hidden">
        <div className="bg-ehs-normal-blue h-full w-full rounded-full motion-safe:w-1/3 motion-safe:animate-[deploy-sweep_1.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
