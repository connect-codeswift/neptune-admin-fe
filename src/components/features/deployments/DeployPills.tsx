import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { DeployTone } from "@/lib/deploy-status";
import { shortenSha } from "@/lib/deploy-status";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";

const TONE_PILL: Record<DeployTone, string> = {
  ok: "bg-ehs-green/12 text-ehs-green",
  warn: "bg-ehs-yellow/14 text-ehs-yellow",
  danger: "bg-ehs-red/12 text-ehs-red",
  muted: "bg-ehs-border-ink/6 text-ehs-muted-text",
};

const TONE_DOT: Record<DeployTone, string> = {
  ok: "bg-ehs-green",
  warn: "bg-ehs-yellow",
  danger: "bg-ehs-red",
  muted: "bg-ehs-border-ink/30",
};

export type DeployStatusPillProps = {
  tone: DeployTone;
  label: ReactNode;
  /** Leading dot, the way Coolify marks service state. */
  dot?: boolean;
  icon?: string;
  title?: string;
  className?: string;
};

export function DeployStatusPill({
  tone,
  label,
  dot = false,
  icon,
  title,
  className = "",
}: Readonly<DeployStatusPillProps>) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text7 ${TONE_PILL[tone]} ${className}`.trim()}
    >
      {dot ? (
        <span className={`size-1.5 shrink-0 rounded-full ${TONE_DOT[tone]}`} aria-hidden />
      ) : null}
      {icon ? <Icon icon={icon} width={12} height={12} aria-hidden /> : null}
      {label}
    </span>
  );
}

export type DeployShaProps = {
  sha: string | null | undefined;
  className?: string;
};

/** Monospace short SHA — the thing developers actually scan the page for. */
export function DeploySha({ sha, className = "" }: Readonly<DeployShaProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-ehs-border-ink/6 px-1.5 py-0.5 text-ehs-darker font-mono text7 ${className}`.trim()}
      title={sha ?? undefined}
    >
      {shortenSha(sha)}
    </span>
  );
}

export type DeployShaTransitionProps = {
  from: string | null;
  to: string | null;
};

export function DeployShaTransition({ from, to }: Readonly<DeployShaTransitionProps>) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <DeploySha sha={from} />
      <Icon
        icon="lucide:arrow-right"
        width={12}
        height={12}
        className="text-ehs-muted-text"
        aria-hidden
      />
      <DeploySha sha={to} />
    </span>
  );
}

export type DeploySectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Glass surface used for every block on the page.
 *
 * A column flexbox with the body as the growing track, so two of these side by
 * side stretch to the same height and the shorter one's empty state centres in
 * the space it is given rather than clinging to the top edge.
 */
export function DeploySectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: Readonly<DeploySectionCardProps>) {
  return (
    <section
      className={`${GLASS_SURFACE} animate-card-rise flex min-w-0 flex-col gap-4 p-4.75 ${className}`.trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-ehs-darker text3">{title}</h2>
          {description ? (
            <p className="text-ehs-muted-text mt-1 text8">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

export type DeployEmptyStateProps = {
  icon: string;
  title: string;
  description?: string;
};

export function DeployEmptyState({
  icon,
  title,
  description,
}: Readonly<DeployEmptyStateProps>) {
  return (
    <div className="flex h-full min-h-40 flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <Icon
        icon={icon}
        width={26}
        height={26}
        className="text-ehs-placeholder"
        aria-hidden
      />
      <p className="text-ehs-darker text5">{title}</p>
      {description ? (
        <p className="text-ehs-muted-text max-w-md text8">{description}</p>
      ) : null}
    </div>
  );
}

export type DeployPanelLoadingProps = {
  /** What is being read, e.g. "deploy history". */
  what: string;
};

/**
 * The in-panel wait. History and alerts resolve after the status snapshot, and
 * now that all three panels are on screen at once an unannounced empty list
 * would read as "nothing has ever shipped" for the moment before they land.
 */
export function DeployPanelLoading({ what }: Readonly<DeployPanelLoadingProps>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex h-full min-h-40 flex-1 items-center justify-center gap-2.5 px-6 py-10"
    >
      <Icon
        icon="lucide:loader-circle"
        width={16}
        height={16}
        className="text-ehs-normal-blue animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <p className="text-ehs-muted-text text8">Reading {what}…</p>
    </div>
  );
}
