# CONTEXT.md — what I read and what I concluded

A working map of `neptune-admin-fe`, written after reading the repo's infrastructure end to end.
It records **my understanding**, including where that understanding disagrees with `AGENTS.md`
and the `.cursor/rules/*.mdc` files. `AGENTS.md` remains the rules file; this is a navigation aid
and a findings log.

Snapshot: branch `stag`, HEAD `6579c7f` ("Merge branch 'stag' ... into stag"), 383 tracked files,
6.4 MB / 38,829 lines under `src/`. Working tree is dirty: five `.docs/*.md` guide copies deleted
but unstaged, `.gitignore` modified, `.env.example` and `.vscode/` untracked. **`stag` is not the
branch `AGENTS.md` prescribes for work** (`hamid`, PR into `origin/dev`) — `hamid` and `dev` both
exist locally; switch before starting new work.

---

## 1. What this app is

Two audiences, one Next.js App Router tree, confirmed by reading every route file:

- **Org admin** (`src/app/[company]/[site]/`) — a tenant's own `Ehs_Director` managing their
  company: users, sites, roles/permissions, KPI targets, doc categories, PPE catalog, regulation
  library, settings.
- **CodeSwift super admin** (`src/app/super/(dashboard)/`) — staff managing every client:
  companies, onboarding, access windows, org limits, subscriptions, deployments, platform ops.

Next.js 16 App Router · React 19 (React Compiler **on**, `reactCompiler: true` in
[next.config.ts](next.config.ts) — no manual `useMemo`/`useCallback`/`memo`) · TypeScript ·
Tailwind v4 (no config file) · TanStack Query v5 · axios · Iconify · Recharts ·
libphonenumber-js. `@/*` → `./src/*`.

No test suite, no `next.config` rewrite/proxy, no middleware. `npm run build` is the real
typecheck; `npm run lint` alongside. `package.json`'s `lint` script is bare `eslint` (flat
config) — no `lint:fix` or `format` script exists here, unlike the sibling frontends.

---

## 2. Directory map (with weight)

```
src/app/            52 files  444 KB   [company]/[site] 192 KB · super/ 152 KB · rest is
                                        (auth)/, globals.css (1,105 lines), root layout/page
src/components/     168 files 1.3 MB   features/ · inputs/ · ui/ · layouts/ · settings/
                                        + loose Text.tsx, ThemeToggle.tsx at the top
src/lib/            42 files  240 KB   axiosInstance, 3 token stores, tenant-context, mappers/,
                                        sidebar builders, several dummy-*.ts placeholders
src/dtos/           24 files  108 KB   req/ (10) + res/ (14)
src/hooks/          17 files  104 KB   one file per screen/domain, not per verb
src/services/       17 files   88 KB   *.service.ts, axios only
src/providers/       4 files   24 KB   Theme, Query, Toast, TenantContext
src/types/           2 files   12 KB   ApiResponse<T> envelope, axios.d.ts module augmentation
src/utils/           7 files   40 KB   date/time/week/month/year/calendar/contact formatters
.cursor/rules/        5 files   28 KB   short-form mirrors of AGENTS.md sections — see §8
.claude/skills/        1 skill          api-integration only (no readonly-props / no-ternaries /
                                        tailwind-utilities / verify-before-done skill here)
```

Component-folder weight inside `src/components/features/` (largest first): `onboarding` 22 files
/ 220 KB — this is the **super-admin client-account** area (Add Company wizard, per-client
Overview/Sites/Modules/Notifications/Subscription tabs, access-window and org-limits panels), not
end-user onboarding · `roles-and-rights` 10 / 96 KB · `auth` 8 / 72 KB · `user-management` 7 /
76 KB · `deployments` 7 / 56 KB · `regulation-library` 7 / 52 KB · `ppe-catalog` 7 / 44 KB ·
`doc-categories` 6 / 44 KB · `dashboard` 4 / 36 KB (one `AdminDashboardPage` for org, one
`SuperAdminDashboardPage` for staff) · `kpi-targets` 4 / 32 KB · `shared` 4 / 24 KB ·
`super-admin` 2 / 20 KB · `site-management` 1 / 20 KB.

`src/components/settings/` (16 files, 124 KB) is its own top-level folder, not under `features/`,
and physically encodes the two-audience split: `TenantProfilePanel`/`TenantSecurityPanel` sit next
to `SuperAdminProfilePanel`/`SuperAdminSecurityPanel` — same settings routes, different component
per account type, picked at render time.

---

## 3. Two apps, one tree — the auth mechanics

Confirmed by reading `auth-tokens.ts`, `axiosInstance.ts`, `dashboard-auth.ts`,
`DashboardAuthGate.tsx`, `TenantContextProvider.tsx`, `tenant-context.ts`, `select-company-flow.ts`
in full.

- **Three localStorage/sessionStorage keys**, all in `src/lib/auth-tokens.ts`:
  `neptune_admin_auth_token` (staff/tenant session), `neptune_admin_org_token` (tenant-scoped,
  minted by `select-company` or `select-site`), `neptune_admin_mfa_token` (sessionStorage, MFA hop
  only). A fourth key, `neptune_admin_role`, stores **not** the backend role string but one of two
  local labels: `"admin"` (tenant `Ehs_Director`) or `"super-admin"` (CodeSwift staff). `Ehs_Lead`
  is rejected server-side at `/v1/admin/auth/login` and is never stored as either.
- `src/lib/axiosInstance.ts` picks the bearer token per request from three URL allowlists
  (`BODY_CREDENTIAL_AUTH_PATHS`, `MFA_BEARER_AUTH_PATHS`, `STAFF_ONLY_AUTH_PATHS`), else
  `orgToken || authToken` — as AGENTS.md describes. **There is a fourth mechanism AGENTS.md
  doesn't mention**: a per-call `neptuneUseStaffToken: true` request-config flag (typed via
  `src/types/axios.d.ts` module augmentation of `AxiosRequestConfig`), used at call sites instead
  of extending the static list — e.g. `companies.service.ts`'s `setCompanyAccessWindow` and
  `setOrganizationLimits` pass it directly rather than adding their URL to
  `STAFF_ONLY_AUTH_PATHS`. Both mechanisms coexist; check for this flag on the call site, not just
  the allowlist, before assuming a request uses `orgToken || authToken`.
- **`DashboardAuthGate`** (`src/components/layouts/DashboardAuthGate.tsx`) wraps both dashboard
  layouts, checks `canAccessDashboard(kind)`, and on first failure sets a **150 ms retry timer**
  before redirecting — the comment explains why: "Tokens may have just been written before
  navigation completed." It also listens for the `storage` event and the in-tab
  `neptune:auth-session-updated` event so a token write in one path re-checks without a reload.
- **`canAccessOrgDashboard()`** (`src/lib/dashboard-auth.ts`) is intentionally defensive beyond the
  stored role label: even if `neptune_admin_role` somehow reads `"admin"`, it decodes the org
  token's own role claim and refuses access if that claim says `Ehs_Lead`.
- **`TenantContextProvider`** reconciles the `[company]/[site]` URL against a cached
  `TenantContextState` in `localStorage["neptune_tenant_context"]` (`src/lib/tenant-context.ts`).
  Two different paths populate that cache depending on who's signed in:
  `ensureTenantAdminContext()` calls `GET /v1/organizations/me` for a tenant admin (their own
  sites only); `enterOrganization()`/`switchOrganizationSite()` call the super-admin
  `companies`/`select-company` endpoints for staff browsing any client. Getting this wrong for a
  new admin-only feature means the header site switcher silently shows the wrong site list.
  A deliberate hydration note is worth preserving verbatim from the source: the loading gate
  checks only `checking` and `orgSite` — never `isSuperAdminRole()` directly — because that reads
  `localStorage`, which doesn't exist during SSR, and gating on it would blank the whole tree on
  first client render.
- The response interceptor distinguishes a **stale-tenant** rejection
  (`isOrgTokenReselectMessage`: "no company selected" / "tenant database is not resolved" /
  "please login first") from a genuine **session-invalid** 401 (`isSessionInvalidMessage`, a
  substring match on messages like "unauthorized", "token expired"). The former clears only the
  org token and fires `neptune:org-token-reselect` (reopens `CompanySitePickerModal`); the latter
  calls `forceLogoutRedirect("/login")` and clears everything.
- **No per-item RBAC on the admin portal's own sidebar.** `ORG_ADMIN_NAV_ITEMS` in
  `src/lib/admin-sidebar.ts` is a static array — every signed-in org admin sees the same eight
  items, gated only by reaching the dashboard at all (`DashboardAuthGate`), not by any
  `permission`/`page:` claim check. This is a real architectural difference from the sibling
  `neptune-app-fe`, which gates its sidebar per item off JWT permission claims — there is no
  `jwt-permissions.ts` equivalent in this repo. (`src/lib/ehs-modules.ts` here is a different
  thing: the canonical EHS module catalog super admins use to license modules **to a client
  company**, not a gate on this app's own nav.)

---

## 4. The data chain (read in full, several domains)

```
src/dtos/req/<domain>.req.ts (Payload types) · src/dtos/res/<domain>.res.ts (Response types)
   ↓
src/services/<domain>.service.ts     axios only; one exported fn per endpoint, JSDoc'd
                                     `METHOD /v1/...`. No React, no toasts.
   ↓
(sometimes) src/lib/mappers/<domain>.mapper.ts    Response → UI view model
   ↓
src/hooks/use<Domain>.ts             "use client"; TanStack Query; exported query-key consts
   ↓
src/components/features/<domain>/<Thing>Page.tsx    route-level composition
```

- Envelope: `ApiResponse<T>` (`src/types/api.types.ts`) =
  `statusCode / success / message / isError / errorDetails / dataModel`. Unwrap with
  `assertApiSuccess` then `unwrapDataModel<T>` / `unwrapList<T>` from `src/lib/api-response.ts` —
  `unwrapList` tolerates a bare array **or** `{items|data|records: T[]}` inside `dataModel`.
  Never read `.dataModel` in a component; confirmed true in every hook I read.
- **Mappers are the exception, not the rule.** Only 4 of the ~14 domains have a
  `src/lib/mappers/*.mapper.ts`: `compliance`, `ppe`, `roles`, `users`. Everything else consumes
  `*.res.ts` response types close to as-is in the hook or component. Don't assume a mapper exists
  for a domain you're extending — check first.
- **Route files are genuinely thin.** Every page under `src/app/[company]/[site]/` and
  `src/app/super/` is a one-line wrapper rendering a `features/<domain>/<Thing>Page.tsx` — verified
  against `roles-and-rights/page.tsx`. Twenty such `*Page.tsx` components exist; this is this
  repo's equivalent of `neptune-app-fe`'s `*Content.tsx` boot-gate pattern, but there is **no**
  shared boot-gate convention here — no repo-wide `isClientReady && hasToken` scaffold. Each
  `*Page.tsx` handles its own loading/empty/error states independently (verified in
  `RolesAndRightsPage`/`PpeCatalogPage`/`AdminDashboardPage` — no shared pattern to copy
  mechanically the way `*Content.tsx` is copied in the sibling app).
- **Query keys carry an explicit tenant scope that AGENTS.md doesn't mention.**
  `src/hooks/useTenantScope.ts` reads the `[company]/[site]` URL params and returns
  `{ key: [company, site], ready }`. Every tenant-scoped hook (roles, PPE, compliance, KPI
  targets…) spreads that tuple into its query key — e.g. `rolesQueryKey(scope)` =
  `["super-admin", "roles", company, site]` — and gates `enabled: scope.ready`. The comment in
  `useTenantScope.ts` explains why: the backend scopes tenant reads by the `SiteId` inside the org
  token, so the same URL returns different rows per site, and an unscoped key would show stale
  data after switching sites in `HeaderSiteChanger`. Mutations invalidate the **prefix** key
  (`ROLES_QUERY_KEY`, not the scoped variant) so React Query's prefix matching covers every
  site's cached entry at once — copy this shape for any new tenant-scoped screen.
- **`dummy-*.ts` / `*.dummy.ts` files coexist with real, wired services** for the same domain more
  often than "dummy" suggests. `usePpeCatalog()` and `useRegulationLibrary()` both call real
  endpoints (`ppe.service.ts`, `compliance.service.ts`) through real mappers — but the mapped
  **view-model type itself is still named** `DummyPpeItem` / `DummyRegulation`, imported from the
  `dummy-*.ts` file that originally defined the placeholder shape. The type name surviving past
  the real wiring is a trap for a future reader: seeing `DummyPpeItem` in a hook signature does
  **not** mean the data is fake. `AdminDashboardPage.tsx` still has one live dummy-org fallback
  (comment: "the real organization id... every company rendered as dummy org '1'"). Check the
  service import, not the type name, before assuming a screen is unwired.

---

## 5. API surface — the same correction as the sibling app

**Every service call is versioned kebab-case REST under `/v1/`** — I grepped all 17
`*.service.ts` files (~55 endpoint calls) and found zero remaining PascalCase/unversioned paths.
Representative families, read from the services directly:

| Area | Base paths |
| --- | --- |
| unified login | `/v1/admin/auth/login` (resolves staff vs tenant server-side) |
| tenant auth | `/v1/auth/{login,register,select-site,verify-mfa,me/change-password}`, `/v1/auth/mfa/{setup,enable,disable}` |
| staff auth | `/v1/super-admin/auth/{login,verify-mfa,bootstrap,forgot-password,reset-password,select-company}`, `/v1/super-admin/auth/mfa/{setup,enable}` |
| org/session | `/v1/organizations/me`, `/v1/users/me`, `/v1/users/me/avatar` |
| companies (staff) | `/v1/super-admin/companies/{id}`, `/{id}/sites`, `/{id}/modules`, `/{id}/access`(+`/history`), `/{id}/limits`(+`/history`) |
| roles | `/v1/super-admin/roles`, `/roles/catalog`, `/roles/permissions`, `/roles/with-permissions`, `/roles/{id}/permissions` |
| sites/users (staff) | `/v1/super-admin/sites`, `/v1/super-admin/users`, `/users/invite`, `/users/stats` |
| dashboard | `/v1/super-admin/dashboard/{summary,recent-activity}` |
| platform ops | `/v1/platform-ops/{alerts,deploy-history,deploy-status}` |
| ppe / compliance / kpi | `/v1/ppe/{items,issues,kpis,inspection-checklists,inspection-status}`, `/v1/compliance-records`+`/search`, `/kpi-targets` |
| docs | `/v1/documents`, `/documents/search`, `/document-categories` |
| files | `/files/upload-intent` (no `/v1` prefix — check before assuming every path is versioned) |

`FEGuides/AdminDashboard.md`, `FEGuides/RBAC.md`, `FEGuides/CompanyAccessWindow.md` do exist in
`neptune-be/FEGuides/` — I confirmed all three on disk — so AGENTS.md's pointer there is accurate.
`.docs/` (deleted in the working tree, see snapshot line) held stale local copies of the same
guides plus `swagger.json`.

---

## 6. Styling — matches AGENTS.md closely, verified line by line

I read all 1,105 lines of `globals.css`. The `ehs-` token system, the surface-role vocabulary
(`ehs-surface`/`-raised`/`-inverse`, `ehs-canvas-dark`, `ehs-on-accent`, `ehs-border-ink`), the
`text1`–`text9` typography utilities (same names, same sizes, same role table as documented), the
full `:root` / `[data-theme="dark"]` duplication, and the `@custom-variant dark` binding to the
attribute rather than `prefers-color-scheme` are **all present and accurate** — this genuinely is
the same design system ported from `neptune-app-fe` and kept in step, as AGENTS.md claims. Dark
mode is real here, not aspirational.

One concrete drift: `GlassCard.tsx`'s own comment says it is "thinner than the original 62%-white
pane" and its `GLASS_SURFACE` constant is `border-ehs-hairline/70 bg-ehs-surface/50
backdrop-blur-xl shadow-(--ehs-shadow-card)` — fully token-based. `.cursor/rules/tailwind-tokens.mdc`
and `.cursor/rules/neptune-admin-fe.mdc`'s "short form" still describe the glass recipe as
`bg-white/62`, `rounded-[20px]`, "soft dual shadow" — the pre-token-migration recipe. Follow the
component, not the `.mdc` short form, for new glass surfaces.

---

## 7. Conventions I will follow

- Components take one `props` parameter typed `Readonly<XProps>` — confirmed as the actual
  pattern (`DashboardAuthGateProps`, `TenantContextProviderProps`, `GlassCardProps`,
  `CompanySitePickerModalProps`, `TextProps` all do this), even though no local skill or `.mdc`
  states the rule explicitly for this repo the way `react-readonly-props.mdc` does in
  `neptune-app-fe`.
- No nested ternaries (Sonar S3358) — `.cursor/rules/sonarqube.mdc` names `describedBy`/field
  messages specifically; use `if`/`else if` or a lookup.
- `Text.tsx` requires an explicit `as` and a single string child — narrower than the sibling app's
  version (this one has no `family` beyond `"font-satoshi"` and injects per-tag aria/title
  attributes for `abbr`/`blockquote`/`pre`/`del`/`ins`).
- `ui/Modal` and `ui/ConfirmDialog` are real `<dialog>` + `showModal()`; listeners registered in
  `useEffect`, never as JSX handlers on the element itself.
- `ui/Table` wraps `columns`/`data`/`getRowId`; no row click handlers, no hand-rolled `<table>`.
- Custom selects/date pickers are a button trigger plus option buttons — never native
  `role="listbox"`. Permissions UI uses `ToggleBadges`, not `MultiBadgesInput`.
- Named exports only, barrel `index.ts` per component folder (`inputs/`, `ui/`, `layouts/`).
- `"use client"` only where state, effects, or a browser API are actually used.
- Before extending any `dummy-*.ts`/`*.dummy.ts`, check for a real service+hook first — and if you
  wire the real thing, don't leave a `Dummy*`-named type behind for the next reader (see §4).
- Verify with `npm run lint` + `npm run build` only — there is no `verify-before-done` skill or
  `.mdc` in this repo, unlike the sibling frontends; the workspace-level skill still applies if
  invoked, it just isn't locally documented here.

---

## 8. Where my reading disagreed with or supplemented the docs

1. **API version + casing is stale in *two* places, not one.** Both
   `.cursor/rules/api-dtos.mdc` ("`POST /Auth/register` → `axiosInstance.post("/Auth/register", …)`")
   and, more importantly, **the checked-in `.claude/skills/api-integration/SKILL.md` itself**
   (`GET /SuperAdminCompanies/{id}/sites` →
   `` axiosInstance.get(`/SuperAdminCompanies/${companyId}/sites`) ``) show the old unversioned
   PascalCase RPC style. The real endpoint, read from `companies.service.ts`, is
   `GET /v1/super-admin/companies/{organizationId}/sites`. Every one of the ~55 calls across 17
   service files is `/v1/` kebab-case. Because the stale example lives inside the skill a future
   session will load verbatim, it's worth fixing there specifically, not just noting here.
2. **`AGENTS.md`'s "three allowlists" for token selection is incomplete.** A fourth mechanism, the
   per-call `neptuneUseStaffToken: true` config flag, is used directly at call sites
   (`companies.service.ts`) instead of extending `STAFF_ONLY_AUTH_PATHS`. See §3.
3. **Sidebar RBAC is a real gap versus the sibling app, not an oversight to fix unasked.**
   `neptune-app-fe`'s AGENTS.md describes a five-step permission-resolution order for its sidebar;
   this repo's sidebar (`admin-sidebar.ts`) has none of that — it's a static list gated only by
   dashboard-level access. Worth knowing before assuming JWT permission claims drive anything
   admin-portal-side.
4. **The glass-card recipe in `.cursor/rules/neptune-admin-fe.mdc` and `tailwind-tokens.mdc`
   (`bg-white/62`, `rounded-[20px]`) is superseded by `GlassCard.tsx`'s token-based
   `GLASS_SURFACE`.** See §6.
5. **FEGuides references check out.** `AdminDashboard.md`, `RBAC.md`, and `CompanyAccessWindow.md`
   all exist in `neptune-be/FEGuides/` exactly as AGENTS.md and the skill describe — no correction
   needed here, called out because I verified rather than assumed it.
6. **Dark mode and the `ehs-`/`text1`–`text9` token system are accurately documented** — I read the
   full 1,105-line `globals.css` rather than sampling it, and AGENTS.md's styling section holds up
   in full. No correction; noted because the sibling app's equivalent claim required qualification
   and this one didn't.

---

## 9. What I have NOT read

Full bodies of most `features/**` components beyond the ones cited above (`RolesAndRightsPage` and
`useRolesAndRights.ts` in full; `PpeCatalogPage`/`usePpeCatalog` and
`RegulationList`/`useRegulationLibrary` for the dummy-type finding; `AdminDashboardPage` and
`CompanySitePickerModal` in part). The 22-file `onboarding/` (client-account management) tree and
the 26-file `inputs/` tree are read only by filename, not by body. Also unread: all four
`src/lib/mappers/*.mapper.ts` bodies beyond `roles.mapper.ts`'s opening types; `public/` (64 KB);
the contents of `.env.example`/`.env.local`/`.env.dev`/`.env.stag`/`.env.prod` (blocked by this
session's permission settings, not a choice — AGENTS.md's description of `NEXT_PUBLIC_API_URL` /
`API_PROXY_TARGET` is taken on trust); and `neptune-be/FEGuides/AdminDashboard.md`'s actual content
(existence confirmed, contents not read). I hold the full file map, so any of these can be read on
demand — `onboarding/` is the one that will need a deliberate pass before touching super-admin
client-account screens.
