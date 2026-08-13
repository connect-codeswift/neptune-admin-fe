# KPI targets — admin portal

> **Contract:** [`neptune-be/FEGuides/KpiTargets.md`](../../neptune-be/FEGuides/KpiTargets.md) is the source of truth. This file is the `neptune-admin-fe` wiring map for the same API.

The org dashboard's Total Users / Sites / Roles cards are **not** this. Those come from `GET /SuperAdminDashboard/summary` and have no targets.

This API sets the numbers the **EHSS app** compares against: Incident RIR/LTIR/MTTC/open incidents/days without LTI, and CAPA open/overdue/on-time/average days.

---

## Status

The backend (`GET/PUT/DELETE /api/KpiTarget`) is live. **This portal has no screen yet.** Do not call `/Incident/kpi-targets` or `/CAPA/kpi-targets` — those routes are gone.

---

## Token

Default axios (`orgToken || authToken`) is correct. Do **not** add `/KpiTarget` to `STAFF_ONLY_AUTH_PATHS` in `src/lib/axiosInstance.ts` — the staff token has no tenant DB.

Reload the form when the header site changer mints a new org token. Targets are per `SiteId` on that token.

A 401 after an overnight tab is an expired org token (8 hours). Re-pick company/site; do not log out. See [AdminDashboard-fe-guide.md](./AdminDashboard-fe-guide.md) §1.5.

Org admins (`Admin` role) can GET and PUT today. CodeSwift staff can GET; PUT currently fails because the superadmin org token has `id` rather than `NameIdentifier`. Treat staff as read-only until that backend gap is fixed.

---

## File layout (when you build the screen)

```
src/dtos/req/kpi-targets.req.ts
src/dtos/res/kpi-targets.res.ts
src/services/kpi-targets.service.ts     axios only — unwrap the envelope here
src/hooks/useKpiTargets.ts              React Query, export the query-key const
src/components/features/kpi-targets/    page under /{company}/{site}/…
```

Suggested route: `/{company}/{site}/kpi-targets`, nav item next to Dashboard. Hide modules that are not in `summary.activatedModules`.

### DTOs

```ts
export type KpiTargetRow = {
  id: number;
  module: string;
  metric: string;
  targetValue: number;
  updatedAt: string; // ISO-8601 with offset
};

export type SaveKpiTargetRequest = {
  module: "Incident" | "CAPA";
  metric: string;
  targetValue: number;
};
```

### Calls

| Method | Path | Body / query |
|---|---|---|
| GET | `/KpiTarget` | `?module=Incident` optional |
| PUT | `/KpiTarget` | `{ module, metric, targetValue }` — one metric per request |
| DELETE | `/KpiTarget/{id}` | clears the target (tile shows none, not zero) |

`targetValue` must be ≥ 0. Empty field in the form = no target; do not PUT `0` to mean "cleared".

### Metric keys (exact)

**Incident** (lower-better except `daysWithoutLti`): `rir`, `ltir`, `mttc`, `openIncidents`, `daysWithoutLti`

**CAPA** (lower-better except `onTimeClosurePercentage`): `openCapas`, `overdueCapas`, `onTimeClosurePercentage`, `averageDaysToClose`

Anything else stores a row no dashboard will read.

---

## What the EHSS app does with a save

`neptune-app-fe` does not need a round-trip to this portal. Incident / CAPA KPI endpoints already embed `target` and `status` from the same `KpiTargets` table. After a PUT, the next EHSS fetch (staleTime 60s) shows the new line.

---

## Do not

- Infer the shape from `.docs/swagger.json` (it still lists `/api/Incident/kpi-targets`).
- Gate the page on `KpiTarget.Update` claims — org admins and staff org-tokens bypass / have none. Gate on "org token exists."
- Configure Command Center / LOTO / PPE targets — those modules do not read this table.
