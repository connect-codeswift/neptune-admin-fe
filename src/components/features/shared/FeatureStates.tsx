import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * The three states every list / panel screen in `features/` has to render:
 * loading, failed, and empty.
 *
 * Before dark mode these were written inline on each page as a single centred
 * `<p>` carrying a copy of the glass recipe. That is fourteen copies of the
 * same surface, all of them light-mode literals, and none of them said what
 * went wrong or offered a way out. They live here so a screen states *which*
 * of the three it is and nothing else.
 *
 * The shape mirrors the sibling EHSS app's incident list: icon, a bold line,
 * a muted explanation, and a retry affordance when one exists.
 */

export type FeatureErrorCardProps = Readonly<{
  /** Bold headline. Say what failed, not that something failed. */
  title?: string;
  message: string;
  /** Omitted when there is nothing useful to retry (e.g. signed out). */
  onRetry?: () => void;
  retryLabel?: string;
  /**
   * Set false when this already sits inside a card — a glass pane nested in a
   * glass pane reads as a rendering mistake.
   */
  surface?: boolean;
  className?: string;
}>;

export function FeatureErrorCard(props: Readonly<FeatureErrorCardProps>) {
  const {
    title = "Something went wrong",
    message,
    onRetry,
    retryLabel = "Retry",
    surface = true,
    className = "",
  } = props;

  return (
    <div
      className={[
        surface ? GLASS_SURFACE : "",
        "flex min-h-45 flex-col items-center justify-center gap-2 px-5 py-8 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon="mdi:alert-circle-outline"
        className="size-8 text-ehs-red"
        aria-hidden="true"
      />
      <p className="text5 text-ehs-darker">{title}</p>
      {/* The failure text is what has to reach a screen reader, so `role`
          lives on it. The retry control below stays a plain button — the repo's
          a11y rule forbids `aria-invalid` on one. */}
      <p className="max-w-md text4 text-ehs-muted-text" role="alert">
        {message}
      </p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          leftIcon="mdi:refresh"
          onClick={onRetry}
          className="mt-1"
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export type FeatureEmptyStateProps = Readonly<{
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** See `FeatureErrorCardProps.surface`. */
  surface?: boolean;
  className?: string;
}>;

export function FeatureEmptyState(props: Readonly<FeatureEmptyStateProps>) {
  const {
    icon = "mdi:tray-remove",
    title,
    description,
    action,
    surface = true,
    className = "",
  } = props;

  return (
    <div
      className={[
        surface ? GLASS_SURFACE : "",
        "flex min-h-45 flex-col items-center justify-center gap-2 px-5 py-8 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon={icon}
        className="size-8 text-ehs-muted-text"
        aria-hidden="true"
      />
      <p className="text5 text-ehs-darker">{title}</p>
      {description ? (
        <p className="max-w-md text4 text-ehs-muted-text">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export type FeatureLoadingCardProps = Readonly<{
  /** Placeholder rows inside the pane. */
  rows?: number;
  /** Announced by screen readers while the blocks are on screen. */
  label?: string;
  className?: string;
}>;

export function FeatureLoadingCard(props: Readonly<FeatureLoadingCardProps>) {
  const { rows = 3, label = "Loading…", className = "" } = props;
  const keys = Array.from({ length: rows }, (_, index) => `row-${String(index)}`);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={[GLASS_SURFACE, "flex flex-col gap-3 p-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Skeleton className="h-4 w-40 rounded-md bg-ehs-skeleton-strong" />
      {keys.map((key) => (
        <Skeleton key={key} className="h-3.5 w-full rounded-md" />
      ))}
    </div>
  );
}

export type FeatureLoadingGridProps = Readonly<{
  /** Cards to stand in for. */
  count?: number;
  label?: string;
  className?: string;
  cardClassName?: string;
}>;

/**
 * Stat rows and card grids: the same placeholder pane repeated, so the layout
 * does not reflow when the query resolves.
 */
export function FeatureLoadingGrid(props: Readonly<FeatureLoadingGridProps>) {
  const {
    count = 4,
    label = "Loading…",
    className = "",
    cardClassName = "min-h-24",
  } = props;
  const keys = Array.from({ length: count }, (_, index) => `card-${String(index)}`);

  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {keys.map((key) => (
        <div
          key={key}
          className={[
            GLASS_SURFACE,
            "flex flex-col justify-center gap-2.5 px-5 py-4",
            cardClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md bg-ehs-skeleton-strong" />
        </div>
      ))}
    </div>
  );
}
