import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { DeployTone } from "@/lib/deploy-status";
import { shortenSha } from "@/lib/deploy-status";

const TONE_PILL: Record<DeployTone, string> = {
  ok: "bg-green/12 text-green",
  warn: "bg-yellow/14 text-yellow",
  danger: "bg-red/12 text-red",
  muted: "bg-darkest/6 text-darkest/55",
};

const TONE_DOT: Record<DeployTone, string> = {
  ok: "bg-green",
  warn: "bg-yellow",
  danger: "bg-red",
  muted: "bg-darkest/30",
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
      className={`inline-flex items-center rounded-md bg-darkest/6 px-1.5 py-0.5 font-mono text7 text-darkest ${className}`.trim()}
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
        className="text-[#8892a3]"
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

/** Glass surface used for every block on the page. */
export function DeploySectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: Readonly<DeploySectionCardProps>) {
  return (
    <section
      className={`rounded-[20px] border border-white/90 bg-white/62 p-5 shadow-lg backdrop-blur-[10px] ${className}`.trim()}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text3 text-darkest">{title}</h2>
          {description ? (
            <p className="mt-1 text6 text-gray">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
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
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Icon icon={icon} width={26} height={26} className="text-[#b3bbc8]" aria-hidden />
      <p className="text5 text-darkest">{title}</p>
      {description ? (
        <p className="max-w-md text6 text-[#8892a3]">{description}</p>
      ) : null}
    </div>
  );
}
