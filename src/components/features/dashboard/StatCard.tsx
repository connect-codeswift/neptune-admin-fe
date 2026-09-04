import { Icon } from "@iconify/react";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * A count and what it is made of — no chart, no arrow badge.
 *
 * The dashboards used to render these through `KpiTrendCard` with a
 * one-element `data` array and a hardcoded `trend: "up"`. Neither part was
 * true: the summary endpoints return scalars (`users.total`, `sites.total`, …)
 * and no series at all, so there was nothing for a sparkline to draw, and the
 * green up-arrow claimed a direction nobody had measured. `KpiTrendCard` now
 * drops the chart below two points, which would have left the lie standing on
 * its own.
 *
 * So these screens stop pretending. The card states the number and the
 * breakdown behind it — "980 active · 224 pending setup" — which is the
 * information the API actually has. `KpiTrendCard` stays for callers that can
 * supply a real series.
 *
 * Layout: four of these sit on one row, so the card is short and dense rather
 * than a tall box holding a small number. The icon is a chip on the leading
 * edge with the label and figure stacked beside it — that reads as one object
 * at a glance, where a label pinned left and an icon pinned right reads as two.
 * `h-full` plus `mt-auto` on the breakdown keeps the row's four cards the same
 * height and their baselines aligned even when one has no breakdown at all.
 */
export type StatCardProps = Readonly<{
  label: string;
  value: string | number;
  /** The composition of `value`, e.g. "980 active · 224 pending setup". */
  detail?: string;
  /** Decorative — the label carries the meaning. */
  icon?: string;
  className?: string;
}>;

export function StatCard(props: Readonly<StatCardProps>) {
  const { label, value, icon, className = "" } = props;

  return (
    // No `gap-*` here: `GlassCard` already sets one, and two gap utilities on
    // one element are resolved by stylesheet order rather than class order.
    <GlassCard className={`h-full min-h-19 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="bg-ehs-normal-blue/12 text-ehs-normal-blue flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Icon icon={icon} className="size-4.5" aria-hidden="true" />
          </span>
        ) : null}

        <div className="min-w-0 flex">
         
          <p className="text2 text-ehs-darker tabular-nums">{value}</p>
         <p className="text7 text-ehs-gray truncate self-end ml-2" title={label}>
            {label}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
