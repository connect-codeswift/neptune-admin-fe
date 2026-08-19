import type { ReactNode } from "react";
import { GLASS_SURFACE, TableStatusBadge, type TableStatus } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * The persistent "who am I looking at" band on the client-account detail page.
 *
 * The detail screen used to be five stacked-card pages behind a tab strip: the
 * moment you left Overview, the client's identity and the handful of facts that
 * decide what you can do to the account — access window, seats, sites, modules
 * — disappeared. This band sits between the page header and the tab strip, so
 * it is on screen on every tab, and it swallows the tab strip as its own base
 * rule rather than leaving a third free-floating slab under the header.
 */
export type ClientVital = Readonly<{
  label: string;
  value: string;
  /** Draws the value in the warning tone — a lapsed window or a cap that is full. */
  alert?: boolean;
  /** Full text for a value that may truncate. */
  title?: string;
}>;

export type ClientVitalsBandProps = Readonly<{
  name: string;
  /** "ID 42", "Code MCH", "Chemicals" — joined with separators, blanks dropped. */
  meta: readonly (string | null | undefined)[];
  status: Extract<TableStatus, "active" | "inactive">;
  statusLabel: string;
  vitals: readonly ClientVital[];
  /** Tab strip, pinned to the bottom edge of the band. */
  footer?: ReactNode;
}>;

/** Up to two letters, so the chip reads as an identity rather than a word. */
function toMonogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function ClientVitalsBand(props: Readonly<ClientVitalsBandProps>) {
  const { name, meta, status, statusLabel, vitals, footer } = props;

  const metaLine = meta.filter(Boolean).join(" · ");

  return (
    <section
      aria-label={`${name} account summary`}
      className={`${GLASS_SURFACE} animate-card-rise flex flex-col overflow-hidden`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
        <span
          aria-hidden="true"
          className="border-ehs-normal-blue/20 bg-ehs-normal-blue/10 text-ehs-normal-blue text5 rounded-2.5 grid size-11 shrink-0 place-items-center border"
        >
          {toMonogram(name)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <p className="text3 text-ehs-darker min-w-0 truncate" title={name}>
              {name}
            </p>
            <TableStatusBadge status={status} label={statusLabel} />
          </div>
          {metaLine ? (
            <p className="text8 text-ehs-muted-text truncate" title={metaLine}>
              {metaLine}
            </p>
          ) : null}
        </div>
      </div>

      {/* One rhythm of facts rather than a card each: the point is that they are
          always readable in a glance, not that each one is a panel. */}
      <dl className="border-ehs-hairline/70 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t px-5 py-4 sm:grid-cols-3 xl:grid-cols-5">
        {vitals.map((vital) => (
          <div key={vital.label} className="flex min-w-0 flex-col gap-1">
            <dt className="text8 text-ehs-muted-text truncate">{vital.label}</dt>
            <dd
              className={`text5 truncate tabular-nums ${
                vital.alert ? "text-ehs-yellow-ink-soft" : "text-ehs-darker"
              }`}
              title={vital.title ?? vital.value}
            >
              {vital.value}
            </dd>
          </div>
        ))}
      </dl>

      {footer}
    </section>
  );
}

/**
 * Same three bands as the loaded component — identity row, vitals grid, tab
 * strip — so the page does not re-flow when the query resolves.
 */
export function ClientVitalsBandSkeleton(
  props: Readonly<{ vitalCount?: number; tabCount?: number }>,
) {
  const { vitalCount = 5, tabCount = 5 } = props;
  const vitalKeys = Array.from(
    { length: vitalCount },
    (_, index) => `vital-${String(index)}`,
  );
  const tabKeys = Array.from(
    { length: tabCount },
    (_, index) => `tab-${String(index)}`,
  );

  return (
    <div className={`${GLASS_SURFACE} flex flex-col overflow-hidden`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <Skeleton className="rounded-2.5 size-11" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="bg-ehs-skeleton-strong h-5 w-56 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
      </div>

      <dl className="border-ehs-hairline/70 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t px-5 py-4 sm:grid-cols-3 xl:grid-cols-5">
        {vitalKeys.map((key) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="bg-ehs-skeleton-strong h-4 w-24 rounded-md" />
          </div>
        ))}
      </dl>

      <div className="border-ehs-border flex gap-6 border-t px-6 py-3.5">
        {tabKeys.map((key) => (
          <Skeleton key={key} className="h-4 w-20 rounded-md" />
        ))}
      </div>
    </div>
  );
}
