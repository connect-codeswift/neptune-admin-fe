import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * The platform totals, as a stacked rail rather than a strip of tiles.
 *
 * These five figures used to run across the full width of the page as five
 * `KpiSummaryCard`s — a full-bleed row spent on five small numbers, sitting
 * directly under a stat row that already said four of them. They are context
 * for the companies table, not a second headline, so they now live in the
 * narrow column beside it: one row each, label and "n active" on the leading
 * edge, the figure on the trailing edge, hairlines between.
 *
 * A row is deliberately not a card. Nesting glass panes inside a glass pane is
 * the thing this layout was trying to get away from, and at rail width a card
 * per figure would be mostly padding.
 */
export type PlatformOverviewStat = Readonly<{
  title: string;
  value: string | number;
  /** How many of `value` are in use — rendered as the row's caption. */
  activeCount: number;
  /** Decorative — the title carries the meaning. */
  icon?: string;
}>;

/** Shared by the list and its skeleton so the two cannot drift apart. */
const ROW_CLASS =
  "flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0";
const LIST_CLASS = "divide-ehs-border/40 flex flex-col divide-y";

export type PlatformOverviewListProps = Readonly<{
  stats: readonly PlatformOverviewStat[];
  className?: string;
}>;

export function PlatformOverviewList(props: Readonly<PlatformOverviewListProps>) {
  const { stats, className = "" } = props;

  return (
    <ul className={`${LIST_CLASS} ${className}`.trim()}>
      {stats.map((stat) => (
        <li key={stat.title} className={ROW_CLASS}>
          <div className="flex min-w-0 items-center gap-2.5">
            {stat.icon ? (
              <span className="bg-ehs-normal-blue/12 text-ehs-normal-blue flex size-8 shrink-0 items-center justify-center rounded-[10px]">
                <Icon icon={stat.icon} className="size-4" aria-hidden="true" />
              </span>
            ) : null}

            <div className="min-w-0">
              <p className="text4 text-ehs-darker truncate" title={stat.title}>
                {stat.title}
              </p>
              <p className="text8 text-ehs-muted-text">
                {stat.activeCount} active
              </p>
            </div>
          </div>

          <p className="text3 text-ehs-darker shrink-0 tabular-nums">
            {stat.value}
          </p>
        </li>
      ))}
    </ul>
  );
}

export type PlatformOverviewListSkeletonProps = Readonly<{
  rows?: number;
  /** Announced by screen readers while the blocks are on screen. */
  label?: string;
  className?: string;
}>;

/**
 * The same rows with their content withheld — chip, two text lines, figure — so
 * the rail keeps its height and rhythm when the query resolves instead of
 * jumping.
 */
export function PlatformOverviewListSkeleton(
  props: Readonly<PlatformOverviewListSkeletonProps>,
) {
  const {
    rows = 5,
    label = "Loading platform overview…",
    className = "",
  } = props;
  const keys = Array.from({ length: rows }, (_, index) => `row-${String(index)}`);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`${LIST_CLASS} ${className}`.trim()}
    >
      {keys.map((key) => (
        <div key={key} className={ROW_CLASS}>
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
            <div className="flex flex-col gap-1.5">
              {/* 16 + 6 + 14 is the resolved height of the `text4` title over
                  its `text8` caption, so the rail does not resize on resolve. */}
              <Skeleton className="bg-ehs-skeleton-strong h-4 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="bg-ehs-skeleton-strong h-5 w-9 rounded-md" />
        </div>
      ))}
    </div>
  );
}
