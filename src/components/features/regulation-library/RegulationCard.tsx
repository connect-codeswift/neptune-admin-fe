"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui";
import type { DummyRegulation } from "@/lib/dummy-regulations";

type RegulationCardProps = Readonly<{
  regulation: DummyRegulation;
}>;

type StatusTone = "active" | "policy" | "draft" | "archived";

/** Neither action has a mutation behind it yet — see the note on the row below. */
const ACTIONS_UNAVAILABLE_REASON =
  "Editing a regulation is not available yet — new regulations are added from “Add Regulation”.";

/** Lookup rather than a ternary chain — S3358 forbids nesting them. */
const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  active: "bg-ehs-green/12 text-ehs-green",
  policy: "bg-ehs-border-ink/6 text-ehs-darker",
  draft: "bg-ehs-yellow/12 text-ehs-yellow-ink-soft",
  archived: "bg-ehs-border-ink/6 text-ehs-gray",
};

function StatusBadge({
  label,
  tone,
}: Readonly<{ label: string; tone: StatusTone }>) {
  const toneClass = STATUS_TONE_CLASS[tone];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text7 tracking-[0.5px] uppercase ${toneClass}`}
    >
      {label}
    </span>
  );
}

function Tag({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center rounded-md bg-ehs-border-ink/6 px-2 py-0.5 text8 text-ehs-slate">
      {label}
    </span>
  );
}

function statusLabel(status: DummyRegulation["status"]): string {
  if (status === "active") return "Active";
  if (status === "draft") return "Draft";
  return "Archived";
}

function statusTone(
  status: DummyRegulation["status"],
): "active" | "draft" | "archived" {
  if (status === "active") return "active";
  if (status === "draft") return "draft";
  return "archived";
}

export function RegulationCard({ regulation }: RegulationCardProps) {
  return (
    <GlassCard className="px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex max-w-full items-center truncate rounded-md bg-ehs-normal-blue/12 px-2 py-0.5 text7 tracking-[0.5px] text-ehs-normal-blue uppercase"
              title={regulation.code}
            >
              {regulation.code}
            </span>
            <StatusBadge
              label={statusLabel(regulation.status)}
              tone={statusTone(regulation.status)}
            />
            {regulation.isPolicy ? (
              <StatusBadge label="Policy" tone="policy" />
            ) : null}
          </div>

          <h3
            className="mt-2 line-clamp-2 text3 text-ehs-darker"
            title={regulation.title}
          >
            {regulation.title}
          </h3>
          <p
            className="mt-1 line-clamp-3 text4 text-ehs-gray"
            title={regulation.description}
          >
            {regulation.description}
          </p>

          {regulation.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {regulation.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 self-start lg:flex-col lg:items-end lg:gap-3">
          <div className="text-right">
            <p className="text1 text-ehs-darker tabular-nums">
              {regulation.compliancePercent}%
            </p>
            <p className="mt-0.5 text7 tracking-[0.5px] text-ehs-muted-text uppercase">
              Compliance
            </p>
          </div>

          {/* Both controls used to fire a toast saying they were "not wired
              yet" — a control that looks live and is not. Disabled, with the
              reason on the group, so the affordance stays where it will be. */}
          <div
            className="flex items-center gap-1.5"
            title={ACTIONS_UNAVAILABLE_REASON}
          >
            <IconButton
              icon="lucide:pencil"
              label={`Edit ${regulation.title}`}
              size="sm"
              disabled
            />
            <IconButton
              icon="lucide:trash-2"
              label={`Delete ${regulation.title}`}
              size="sm"
              variant="soft"
              disabled
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
