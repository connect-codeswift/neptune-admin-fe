"use client";

import { toast } from "sonner";
import { IconButton } from "@/components/ui";
import type { DummyRegulation } from "@/lib/dummy-regulations";

type RegulationCardProps = Readonly<{
  regulation: DummyRegulation;
}>;

function StatusBadge({
  label,
  tone,
}: Readonly<{ label: string; tone: "active" | "policy" | "draft" | "archived" }>) {
  const toneClass =
    tone === "active"
      ? "bg-green/12 text-green"
      : tone === "policy"
        ? "bg-darkest/6 text-darkest"
        : tone === "draft"
          ? "bg-yellow/12 text-yellow"
          : "bg-darkest/6 text-gray";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text7 font-semibold tracking-[0.5px] uppercase ${toneClass}`}
    >
      {label}
    </span>
  );
}

function Tag({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center rounded-md bg-darkest/6 px-2 py-0.5 text6 text-darkest">
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
    <article className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-normal/12 px-2 py-0.5 text7 font-semibold tracking-[0.5px] text-blue-normal uppercase">
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

          <h2 className="mt-2 text3 text-darkest">{regulation.title}</h2>
          <p className="mt-1 text5 text-gray">{regulation.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {regulation.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-4 self-start lg:flex-col lg:items-end lg:gap-3">
          <div className="text-right">
            <p className="text1 text-darkest">{regulation.compliancePercent}%</p>
            <p className="mt-0.5 text7 font-semibold tracking-[0.5px] text-[#8892a3] uppercase">
              Compliance
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <IconButton
              icon="lucide:pencil"
              label={`Edit ${regulation.title}`}
              size="sm"
              onClick={() =>
                toast.info(`Edit ${regulation.title} is not wired yet.`)
              }
            />
            <IconButton
              icon="lucide:trash-2"
              label={`Delete ${regulation.title}`}
              size="sm"
              variant="soft"
              onClick={() =>
                toast.info(`Delete ${regulation.title} is not wired yet.`)
              }
            />
          </div>
        </div>
      </div>
    </article>
  );
}
