"use client";

import type { DeployStatusResponse } from "@/dtos/res/platform-ops.res";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import {
  formatElapsed,
  formatInstant,
  formatRelative,
  formatRelativeOrRaw,
} from "@/lib/deploy-status";
import { DeployInProgressStrip, DeployStatusBanner } from "./DeployStatusBanner";

function MetaChip({
  label,
  value,
  title,
}: Readonly<{ label: string; value: string; title?: string }>) {
  return (
    // The value truncates on a narrow window, so the full string is always
    // available on hover even when the chip has no explanatory `title`.
    <div className="min-w-0" title={title ?? value}>
      <p className="text-ehs-muted-text text8 tracking-[0.66px] uppercase">
        {label}
      </p>
      <p className="text-ehs-darker mt-1 truncate text5">{value}</p>
    </div>
  );
}

export type DeployStatusHeroProps = {
  status: DeployStatusResponse;
};

/**
 * The top of the page, as one block.
 *
 * The verdict, the live deploy counter and the five facts that qualify it
 * (which host, how old the snapshot is, when the timer fires next) used to be
 * three separate slabs of equal weight stacked down the page. They answer one
 * question between them, so they are one card: verdict first at heading size,
 * its supporting numbers underneath a hairline.
 */
export function DeployStatusHero({ status }: Readonly<DeployStatusHeroProps>) {
  return (
    <section
      className={`${GLASS_SURFACE} animate-card-rise flex min-w-0 flex-col gap-3.5 p-4.75`}
    >
      <DeployStatusBanner status={status} />

      {status.deploy.inProgress ? (
        <DeployInProgressStrip
          startedAt={status.deploy.startedAt}
          apps={status.deploy.apps}
          currentApp={status.deploy.currentApp}
        />
      ) : null}

      <div className="border-ehs-hairline/70 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t pt-4 sm:grid-cols-3 xl:grid-cols-5">
        <MetaChip label="Host" value={status.host || "—"} />
        <MetaChip
          label="Snapshot age"
          value={formatElapsed(status.ageSeconds)}
          title={`Written ${formatInstant(status.generatedAt)}`}
        />
        <MetaChip
          label="Next check"
          value={formatRelativeOrRaw(status.deploy.timerNext)}
          title="The timer polls main every 2 minutes."
        />
        <MetaChip
          label="Last cycle"
          value={formatRelative(status.deploy.lastFinished)}
          title={formatInstant(status.deploy.lastFinished)}
        />
        <MetaChip
          label="Cycle result"
          value={status.deploy.lastResult || "—"}
          title="systemd Result. A cycle that skipped an app for a failing build exits non-zero on purpose, so exit-code is not automatically bad — judge by the stuck line on the app row."
        />
      </div>
    </section>
  );
}
