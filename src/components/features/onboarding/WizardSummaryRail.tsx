"use client";

import { Icon } from "@iconify/react";
import { CardHeading } from "@/components/ui/CardHeading";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { getModuleOptions } from "@/lib/ehs-modules";
import type { SiteDraft } from "./SetupStepTwo";

export type WizardSummaryRailProps = {
  organizationName: string;
  selectedModules: string[];
  sites: SiteDraft[];
  /** The site still sitting in the step-two form — it ships with the rest. */
  pendingSiteName: string;
  adminName: string;
  adminEmail: string;
  /** Zero-based index of the step being edited, so its row can say so. */
  activeStepIndex: number;
  className?: string;
};

type SummaryEntry = {
  id: string;
  icon: string;
  label: string;
  /** `null` renders the "not entered yet" placeholder rather than a value. */
  value: string | null;
  meta: string | null;
  stepIndex: number;
};

function joinNames(names: string[], limit: number): string {
  if (names.length <= limit) return names.join(", ");
  return `${names.slice(0, limit).join(", ")} +${names.length - limit} more`;
}

function describeModules(selectedModules: string[]): string | null {
  if (selectedModules.length === 0) {
    return "No modules yet — the client starts almost empty";
  }

  const labels = new Map(
    getModuleOptions().map((option) => [option.value, option.label]),
  );
  const names = selectedModules.map((id) => labels.get(id) ?? id);
  const noun = selectedModules.length === 1 ? "module" : "modules";

  return `${selectedModules.length} ${noun} · ${joinNames(names, 3)}`;
}

function describeSites(
  sites: SiteDraft[],
  pendingSiteName: string,
): { value: string | null; meta: string | null } {
  const names = sites.map((site) => site.name);
  const trimmedPending = pendingSiteName.trim();
  if (trimmedPending) {
    names.push(trimmedPending);
  }

  if (names.length === 0) {
    return { value: null, meta: null };
  }

  const noun = names.length === 1 ? "site" : "sites";
  return {
    value: `${names.length} ${noun}`,
    meta: joinNames(names, 3),
  };
}

function SummaryRow({
  entry,
  isActive,
}: Readonly<{ entry: SummaryEntry; isActive: boolean }>) {
  let valueNode = <p className="text-ehs-placeholder text8">Not entered yet</p>;
  if (entry.value) {
    valueNode = (
      <p className="text-ehs-darker truncate text5" title={entry.value}>
        {entry.value}
      </p>
    );
  }

  let rowClass = "border-l-2 border-transparent pl-3";
  if (isActive) {
    rowClass = "border-ehs-normal-blue border-l-2 pl-3";
  }

  return (
    <div className={`flex min-w-0 flex-col gap-1 py-3 ${rowClass}`}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="text-ehs-muted-text flex items-center gap-1.5 text8 tracking-[0.66px] uppercase">
          <Icon icon={entry.icon} width={12} height={12} aria-hidden />
          {entry.label}
        </p>
        {isActive ? (
          <span className="text-ehs-normal-blue shrink-0 text8">
            Editing now
          </span>
        ) : null}
      </div>

      {valueNode}

      {entry.meta ? (
        <p className="text-ehs-muted-text truncate text8" title={entry.meta}>
          {entry.meta}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A running read-out of what the three steps have collected so far.
 *
 * The wizard's own state is the source of truth — this only renders it — so by
 * the last step the thing you are about to create is on screen next to the
 * button that creates it, instead of two steps behind you.
 */
export function WizardSummaryRail({
  organizationName,
  selectedModules,
  sites,
  pendingSiteName,
  adminName,
  adminEmail,
  activeStepIndex,
  className = "",
}: Readonly<WizardSummaryRailProps>) {
  const siteSummary = describeSites(sites, pendingSiteName);
  const trimmedOrganization = organizationName.trim();
  const trimmedAdminName = adminName.trim();
  const trimmedAdminEmail = adminEmail.trim();

  const entries: SummaryEntry[] = [
    {
      id: "organization",
      icon: "lucide:building-2",
      label: "Organization",
      value: trimmedOrganization || null,
      meta: describeModules(selectedModules),
      stepIndex: 0,
    },
    {
      id: "sites",
      icon: "lucide:map-pin",
      label: "Sites",
      value: siteSummary.value,
      meta: siteSummary.meta,
      stepIndex: 1,
    },
    {
      id: "admin",
      icon: "lucide:key-round",
      label: "Administrator",
      value: trimmedAdminName || null,
      meta: trimmedAdminEmail || null,
      stepIndex: 2,
    },
  ];

  return (
    <aside
      className={`${GLASS_SURFACE} animate-card-rise flex min-w-0 flex-col gap-2 p-4.75 ${className}`.trim()}
    >
      <CardHeading
        title="What you are creating"
        subtitle="Filled in as you go — this is the account that gets created."
      />

      <div className="divide-ehs-hairline/70 flex min-w-0 flex-col divide-y">
        {entries.map((entry) => (
          <SummaryRow
            key={entry.id}
            entry={entry}
            isActive={entry.stepIndex === activeStepIndex}
          />
        ))}
      </div>
    </aside>
  );
}
