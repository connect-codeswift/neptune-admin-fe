import type { KpiTargetModule } from "@/dtos/req/kpi-targets.req";

/**
 * The metric keys the EHSS dashboards actually look up.
 *
 * These must match the reader's key, not a display label — a typo stores a row no
 * dashboard will ever read. Source: `FEGuides/KpiTargets.md` §4 in
 * `connect-codeswift/Neptune-Ehss-BE`.
 *
 * Only Incident and CAPA consume this table. Command Center, LOTO and PPE do not —
 * do not add sections for them.
 */

export type KpiMetricDefinition = {
  /** Exact string written to the API. Case matters on write. */
  metric: string;
  /** Tile name as it appears in the EHSS app. */
  label: string;
  unit: string;
  /** Which direction counts as meeting the target. */
  betterWhen: "lower" | "higher";
  /** Shown under the field when the metric needs explaining. */
  hint?: string;
};

export type KpiModuleDefinition = {
  module: KpiTargetModule;
  label: string;
  description: string;
  icon: string;
  /** Matched case-insensitively against the org's activated modules. */
  activationKeys: readonly string[];
  metrics: readonly KpiMetricDefinition[];
};

export const KPI_TARGET_MODULES: readonly KpiModuleDefinition[] = [
  {
    module: "Incident",
    label: "Incident",
    description:
      "Read by the incident dashboard header and the incident list KPI strip.",
    icon: "lucide:triangle-alert",
    activationKeys: ["incident", "incidents", "incident management"],
    metrics: [
      {
        metric: "rir",
        label: "Recordable Incident Rate (RIR)",
        unit: "per 200k hrs",
        betterWhen: "lower",
        hint: "Needs at least 5,000 YTD site work hours before the tile shows a rate. The target saves regardless.",
      },
      {
        metric: "ltir",
        label: "Lost Time Incident Rate (LTIR)",
        unit: "per 200k hrs",
        betterWhen: "lower",
        hint: "Same work-hours requirement as RIR.",
      },
      {
        metric: "mttc",
        label: "Mean Time to Close",
        unit: "days",
        betterWhen: "lower",
      },
      {
        metric: "openIncidents",
        label: "Open Incidents",
        unit: "count",
        betterWhen: "lower",
      },
      {
        metric: "daysWithoutLti",
        label: "Days Without LTI",
        unit: "days",
        betterWhen: "higher",
      },
    ],
  },
  {
    module: "CAPA",
    label: "CAPA",
    description: "Read by the CAPA dashboard's four KPI tiles.",
    icon: "lucide:clipboard-check",
    activationKeys: ["capa", "capas"],
    metrics: [
      {
        metric: "openCapas",
        label: "Open CAPAs",
        unit: "count",
        betterWhen: "lower",
      },
      {
        metric: "overdueCapas",
        label: "Overdue CAPAs",
        unit: "count",
        betterWhen: "lower",
      },
      {
        metric: "onTimeClosurePercentage",
        label: "On-time Closure",
        unit: "%",
        betterWhen: "higher",
      },
      {
        metric: "averageDaysToClose",
        label: "Average Days to Close",
        unit: "days",
        betterWhen: "lower",
      },
    ],
  },
];

/**
 * Whether the org has this module switched on.
 *
 * `activatedModules.modules` is a free-text, comma-separated string set in the client
 * account screen, so matching is lenient. When it is missing entirely we show the
 * module rather than hide it — a hidden section a customer is entitled to is a worse
 * failure than an extra one.
 */
export function isModuleActivated(
  definition: KpiModuleDefinition,
  activatedModules: string | null | undefined,
): boolean {
  if (!activatedModules || activatedModules.trim() === "") {
    return true;
  }

  const entries = activatedModules
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== "");

  if (entries.length === 0) {
    return true;
  }

  return entries.some((entry) =>
    definition.activationKeys.some(
      (key) => entry === key || entry.includes(key),
    ),
  );
}
