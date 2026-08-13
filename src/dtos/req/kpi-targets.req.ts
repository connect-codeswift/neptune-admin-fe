/**
 * Request shapes for `api/KpiTarget`.
 *
 * Contract: `FEGuides/KpiTargets.md` in `connect-codeswift/Neptune-Ehss-BE`.
 */

/** Only these two modules read the KpiTargets table. */
export type KpiTargetModule = "Incident" | "CAPA";

/**
 * One metric per request. The unique key is (SiteId, Module, Metric), so a PUT
 * overwrites rather than duplicates — and revives a previously cleared row.
 *
 * `targetValue` must be >= 0. `0` is a real target ("zero open CAPAs"), not a
 * clear — use DELETE for that.
 */
export type SaveKpiTargetPayload = {
  module: KpiTargetModule;
  metric: string;
  targetValue: number;
};
