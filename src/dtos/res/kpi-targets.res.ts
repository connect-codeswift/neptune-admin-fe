/**
 * Response shapes for `api/KpiTarget`.
 *
 * Contract: `FEGuides/KpiTargets.md` in `connect-codeswift/Neptune-Ehss-BE`.
 * One row per (SiteId, Module, Metric). SiteId defaults to the org token's site
 * but `GET /v1/kpi-targets` also accepts an explicit `siteId` query parameter
 * for a live site the caller is a member of.
 */

/** One saved target. `id` is required to clear it — keep it on the row. */
export type KpiTargetResponse = {
  id: number;
  module: string;
  metric: string;
  targetValue: number;
  /** ISO-8601 with an explicit offset. */
  updatedAt: string;
};

/** `dataModel` of a successful PUT. */
export type SaveKpiTargetResponse = {
  id: number;
};
