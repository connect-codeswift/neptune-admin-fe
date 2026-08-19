<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# neptune-admin-fe — admin portal

Two audiences in one App Router tree: **CodeSwift staff** (super admin — companies, pricing,
subscriptions, deployments, chatbot) and **org admins** (their own company's sites, users,
roles, catalogs).

Repo: `connect-codeswift/neptune-admin-fe`. Next.js 16 App Router · React 19 · TypeScript ·
Tailwind v4 · TanStack Query v5 · axios · Iconify · Recharts. `@/*` → `./src/*`.
React Compiler is **on** (`reactCompiler: true` in [next.config.ts](next.config.ts)) — do not
add `useMemo` / `useCallback` / `memo` for performance.

## Branches

Work on `hamid` → push `origin/hamid`. **`origin/dev` is the integration branch and holds the
latest** — branch from it and PR into it. `main` and `stag` trail behind.

The backend is `connect-codeswift/Neptune-Ehss-BE` (`origin/Staging` is its live branch). It serves
this portal *and* four other apps — never assume an endpoint exists only for us.

## Commands

```bash
npm run dev     # next dev
npm run build   # next build — the real typecheck
npm run lint    # eslint (flat config, next/core-web-vitals + typescript)
```

There are **no tests** and no test runner. Verify with `npm run lint` and `npm run build`.

Env: copy `.env.example` → `.env.local`. `NEXT_PUBLIC_API_URL` (the .NET backend, ends in
`/api`) is what axios uses as `baseURL`; `API_PROXY_TARGET` is the server-side rewrite target.
`.env.dev` / `.env.stag` / `.env.prod` exist for the other environments.

## Two applications in one App Router tree

| Route group | Audience | Auth token | Layout |
| --- | --- | --- | --- |
| `src/app/(auth)/` | unified login, MFA, password reset | — | [(auth)/layout.tsx](<src/app/(auth)/layout.tsx>) |
| `src/app/[company]/[site]/` | org admin dashboard, tenant-scoped | org token | [layout.tsx](<src/app/[company]/[site]/layout.tsx>) wraps `TenantContextProvider` |
| `src/app/super/(auth)/` | bootstrap only; old login URLs redirect to `(auth)/` | — | [super/(auth)/layout.tsx](<src/app/super/(auth)/layout.tsx>) |
| `src/app/super/(dashboard)/` | super admin (companies, pricing, subscriptions, chatbot) | staff token | [super/(dashboard)/layout.tsx](<src/app/super/(dashboard)/layout.tsx>) |

One login screen at `/login` calls `POST /AdminPortalAuth/login`. The response includes
`accountType` (`staff` | `tenant`), stored in sessionStorage for the MFA hop. MFA pages at
`/login/mfa` and `/login/mfa-setup` branch on that value: staff continues on
`SuperAdminAuth/*`, tenant on `Auth/*`. Config lives in
[src/lib/portal-auth.ts](src/lib/portal-auth.ts) and [src/lib/auth-flow.ts](src/lib/auth-flow.ts)
(`PORTAL_AUTH`).

There is **no middleware/proxy** (tokens are in `localStorage`, not cookies). Route protection
is client-side:

- **[DashboardAuthGate](src/components/layouts/DashboardAuthGate.tsx)** wraps both dashboard
  layouts — super admin requires staff token + `super-admin` role; org dashboard requires org
  token (org admin) or staff token (super admin viewing a tenant).
- **[TenantContextProvider](src/providers/TenantContextProvider.tsx)** reconciles super-admin org
  tokens against the URL and opens `CompanySitePickerModal` when needed.

## Auth & multi-tenancy

This is the part that requires reading several files to understand. Three tokens, in
[src/lib/auth-tokens.ts](src/lib/auth-tokens.ts):

- **auth token** (localStorage) — the staff/user session issued at login.
- **org token** (localStorage) — issued by `SuperAdminAuth/select-company`; scopes requests to
  one tenant DB.
- **mfa token** (sessionStorage) — short-lived, only for the MFA setup/verify hop.

[src/lib/axiosInstance.ts](src/lib/axiosInstance.ts) picks the token per request from three URL
allowlists:

- `BODY_CREDENTIAL_AUTH_PATHS` — credentials in the body, `Authorization` stripped.
- `MFA_BEARER_AUTH_PATHS` — sends the MFA token.
- `STAFF_ONLY_AUTH_PATHS` — must use the staff token even when an org token exists.
- Everything else: `orgToken || authToken`.

Adding a backend endpoint that doesn't follow "org token if present" means adding it to the
right list.

The response interceptor rejects with `ApiError` and handles three cases: a stale-tenant message
(`isOrgTokenReselectMessage`) clears the org token and fires the `neptune:org-token-reselect`
window event; a 401 with org token only (org admin) clears the session and redirects to
`/login`; any other 401 with a staff token clears all tokens and redirects to `/login` (via
`forceLogoutRedirect` in [auth-tokens.ts](src/lib/auth-tokens.ts)).

[TenantContextProvider](src/providers/TenantContextProvider.tsx) listens for that event,
reconciles the `[company]/[site]` URL segments against the cached tenant context
([src/lib/tenant-context.ts](src/lib/tenant-context.ts)), and opens `CompanySitePickerModal`
when they disagree. Site lists come from that cache, not a fetch — see
[src/lib/org-sites.ts](src/lib/org-sites.ts). After org login, the dashboard path is derived by
decoding org/site claims out of the JWT in [src/lib/auth-redirect.ts](src/lib/auth-redirect.ts).

## Data layer

Strict one-way chain — do not skip a link:

```
src/services/*.service.ts   axios calls only; one function per endpoint, JSDoc'd with METHOD /Path
        ↓
src/hooks/use*.ts           "use client"; React Query; exports its own query-key consts
        ↓
src/components/features/*   presentation
```

Every backend response is `ApiResponse<T>`
(`statusCode/success/message/isError/errorDetails/dataModel`,
[src/types/api.types.ts](src/types/api.types.ts)). Hooks unwrap it via the helpers in
[src/lib/api-response.ts](src/lib/api-response.ts) — `assertApiSuccess` first, then
`unwrapDataModel<T>` or `unwrapList<T>` (which tolerates `items`/`data`/`records` pagination
shapes). Never read `.dataModel` directly in a component.

Query keys are exported consts next to the hook (e.g. `DOC_CATEGORIES_KEY`) so mutations can
invalidate them; follow that pattern rather than inlining key arrays.

DTOs live in `src/dtos/req/<domain>.req.ts` (types end in `Payload`) and
`src/dtos/res/<domain>.res.ts` (types end in `Response`) — see
[.cursor/rules/api-dtos.mdc](.cursor/rules/api-dtos.mdc). Export a named type even when Swagger
defines no schema (`export type XResponse = unknown`). Backend shapes are converted to view
models in [src/lib/mappers/](src/lib/mappers/).

`.docs/swagger.json` is the raw contract, but **the authoritative one is `FEGuides/<Module>.md`
in `connect-codeswift/Neptune-Ehss-BE`** — read the guide before wiring an endpoint.
`FEGuides/AdminDashboard.md` covers all three token types and every admin screen;
`FEGuides/RBAC.md` covers roles and permissions; `FEGuides/CompanyAccessWindow.md` covers
time-boxed company access.

`src/lib/dummy-*.ts` and `*.dummy.ts` are placeholder data for screens whose endpoints aren't
wired yet — check whether a real service/hook exists before extending them.

## Components

`src/components/` splits four ways, each with a barrel `index.ts` and **named exports only**:

- `inputs/` — form controls. Shared prop contract: `label`, `helperText`/`error`,
  `containerClassName`. Custom select/date pickers are a button trigger plus option buttons
  (never native `role="listbox"`). Permissions UI uses `ToggleBadges`, not `MultiBadgesInput`.
- `ui/` — chrome: `Button`/`IconButton`/`TextButton` (forwardRef where focus matters),
  `Modal`/`ConfirmDialog` (real `<dialog>` + `showModal()`, listeners registered in `useEffect`
  — never JSX handlers on `<dialog>`), `Table` (`columns`/`data`/`getRowId` + cell helpers, no
  row click handlers).
- `layouts/` — `DashboardSidebar`, `DashboardHeader` (search is a ⌘K trigger via
  `onSearchOpen`), `PageHeader`.
- `features/<domain>/` — page-level composition, one folder per route domain.

`"use client"` only where actually needed. Full component contract:
[.cursor/rules/ui-components.mdc](.cursor/rules/ui-components.mdc).

## Styling

Tailwind v4, tokens declared in `@theme` in [src/app/globals.css](src/app/globals.css) — brand
`blue-normal` `#0891a6`, plus `darkest`, `gray`, `lightgray`, `muted`, `green`/`red`/`yellow`.
Typography uses the `.text1`–`.text9` base-layer classes, not ad-hoc font sizes. Glass surfaces:
`bg-white/62`, `rounded-[20px]`, soft dual shadow.

Prefer scale tokens over arbitrary px when equivalent (`rounded-[12px]`→`rounded-xl`,
`w-[236px]`→`w-59`, `size-[30px]`→`size-7.5`); keep true one-offs like `rounded-[20px]`. Icons
via Iconify; pixel-exact logos go in `public/`. Full list:
[.cursor/rules/tailwind-tokens.mdc](.cursor/rules/tailwind-tokens.mdc).

## Sonar / a11y rules that must not regress

From [.cursor/rules/sonarqube.mdc](.cursor/rules/sonarqube.mdc): no nested ternaries (S3358 —
use `if`/`else if`, notably for `describedBy` and field messages); `arr.at(-1)` over
`[length-1]`; no `aria-invalid` on `<button>` (use `aria-describedby` → `role="alert"`); custom
selects use `aria-haspopup`/`aria-expanded`/`aria-pressed`; no JSX handlers on `<dialog>`,
`<tr>`, or non-interactive divs; backdrop dismiss must be a real `<button>`; OTP inputs use
`<fieldset>`/`<legend>`.
