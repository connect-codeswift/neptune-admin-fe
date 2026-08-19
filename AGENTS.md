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

## Styling — the EHSS design language

This app shares its design system with `connect-codeswift/neptune-ehss-fe`. The token block in
[src/app/globals.css](src/app/globals.css) is **ported from that repo and kept in step with it** —
when the two disagree, the EHSS repo is the source of truth. Tailwind v4, no `tailwind.config.js`.

**Every colour is a token, and every token is defined twice** — once under `:root` and once under
`[data-theme="dark"]`. A screen written against tokens is already dark-ready; one written against
`#0b1320` or `bg-white` is not. That is the whole contract.

Tokens are `ehs-` prefixed: `ehs-normal-blue` (+ `-hover` / `-active` / `-bg-light`),
`ehs-light-blue`, `ehs-dark-blue`, `ehs-darker` (primary ink), `ehs-gray`, `ehs-slate`,
`ehs-muted-text`, `ehs-placeholder`, `ehs-green` / `-red` / `-yellow` / `-orange` / `-purple` /
`-blue` / `-navy`, `ehs-border`, `ehs-border-strong`, `ehs-border-ink`, `ehs-hairline`,
`ehs-light-bg`, and the surface roles below. Grep `globals.css` before hardcoding a hex.

### Surfaces are roles, not colours

- `ehs-surface` — card and panel fill. `bg-ehs-surface/50` is the frosted variant.
- `ehs-surface-raised` — one step off the card: hovered rows, sunken wells, disabled fields.
- `ehs-surface-inverse` — deliberately opposite the page (dark chips on light, light on dark).
- `ehs-canvas-dark` — dark in **both** themes. For things dark by design, not by theme: the
  sign-in brand panel, media viewers. Inverting those would put a light panel behind white
  artwork.
- `ehs-on-accent` — ink on a *filled* accent. Not the same as `ehs-light-text` (white in both
  themes): accent fills lighten in dark, where white on them fails contrast outright.
- `ehs-border-ink` — opaque border ink, dark in light theme and **light in dark**, so
  `border-ehs-border-ink/8` stays a hairline in both.

### Legacy colour names

The pre-port palette (`darkest`, `gray`, `blue-normal`, `bg`, `lightgray`, `border`, `muted`,
`green`/`red`/`yellow`, …) still resolves: the names are kept at the bottom of `@theme inline` as
**aliases onto the themed roles**, so the ~200 components written against them flip for free. They
are aliases, not a second palette — every value is a `var()` to a token above.

**New code uses the `ehs-` names directly.** Do not add new call sites for the legacy names, and do
not mass-rename existing ones — that diff is pure churn and every edit risks changing a screen.

One name could not be aliased: `darkest` as a *fill* (`bg-darkest`) rather than as ink. Ink inverts
in dark and the sign-in panel must not, so those call sites use `bg-ehs-canvas-dark`.

### Type, surfaces, shadows

Typography is the `text1`–`text9` utilities (defined in `globals.css`, sizes match the EHSS repo),
never ad-hoc font sizes. They carry **no colour** — always pair with a token: `text1 text-ehs-darker`,
`text4 text-ehs-gray`, `text8 text-ehs-muted-text`.

| Class   | Size / weight            | Role                          |
| ------- | ------------------------ | ----------------------------- |
| `text1` | 20→24px bold             | page title                    |
| `text2` | 30px normal, tabular     | KPI / hero figure             |
| `text3` | 18px bold                | card / section title          |
| `text4` | 14px normal              | **primary body**, table row   |
| `text5` | 14px bold                | emphasis, badge label         |
| `text6` | 12px bold **UPPERCASE**  | eyebrow, table column header  |
| `text7` | 12px semibold, tabular   | dense ID, numeric meta        |
| `text8` | 12px normal              | caption, helper text          |
| `text9` | 14px semibold UPPERCASE  | meta field label              |

**Body text is `text4`, captions are `text8`, and both are normal weight.** In the EHSS repo those
two carry about 70% of all type. If a screen has more bold lines than plain ones, its weights are
inverted — that is a bug, not a style.

> **Trap, and the reason this table exists.** This scale replaced an older one that used the *same
> class names for different roles*: `text5` was `font-medium` and served as the base body text, and
> `text6` was `font-medium` small body. Under the current scale both are bold — and `text6` is also
> uppercased. Adopting the new definitions without remapping the call sites turned every paragraph
> in the app bold, across ~250 sites, because nothing errored: the classes still existed and still
> applied, they just meant something else.
>
> Those call sites have been remapped (old `text5` body → `text4`, old `text6` body → `text8`). If
> you find a stray one, the tell is `text6` on text that is not meant to be shouted in capitals.
> Never port a type scale by swapping its definitions — the names are not the contract, the roles
> are.
[src/components/Text.tsx](src/components/Text.tsx) is the typography primitive; it takes a required
`as` and a single string child.

Cards are [`GlassCard`](src/components/ui/GlassCard.tsx) (or its exported `GLASS_SURFACE` constant),
with [`CardHeading`](src/components/ui/CardHeading.tsx) for the title/subtitle row. **Do not retype
the glass recipe** — it used to be copy-pasted across a dozen files and could not be changed in one
place.

Elevation is a token referenced by class: `shadow-(--ehs-shadow-card)`, `-card-hover`, `-panel`,
`-popover`, `-modal`, `-tooltip`, `-button-primary`, `-button-danger`. Dark mode drops the coloured
button glow entirely rather than recolouring it, which is why the whole shadow list is the token
and not just its colour.

Numeric radius tokens (`rounded-0.5` / `-0.75` / `-2.5` / `-3` / `-3.5` / `-4` / `-5`) exist because
Tailwind's named scale stops short — keep them defined or corners render square.

Prefer scale tokens over arbitrary px when equivalent (`rounded-[12px]`→`rounded-xl`,
`w-[236px]`→`w-59`, `size-[30px]`→`size-7.5`). Icons via Iconify (`mdi:*`); pixel-exact logos go in
`public/`. Full list: [.cursor/rules/tailwind-tokens.mdc](.cursor/rules/tailwind-tokens.mdc).

### Dark mode

`<html data-theme>` is always concrete — `"system"` is resolved to `light`/`dark` by the inline
script in [src/app/layout.tsx](src/app/layout.tsx) **before first paint**, so there is no flash.
Nothing is behind `prefers-color-scheme` in CSS, because then an explicit choice and the OS setting
could disagree. The preference lives in `localStorage["neptune-theme"]`, per device.

[src/lib/theme.ts](src/lib/theme.ts) owns the store (modelled with `useSyncExternalStore`, so
reading localStorage cannot cause a hydration mismatch);
[src/providers/ThemeProvider.tsx](src/providers/ThemeProvider.tsx) exposes
`{ preference, resolvedTheme, setPreference, isReady }`. **Anything that renders differently per
theme must wait for `isReady`** or it renders the default on the server and the real value on the
client.

`@custom-variant dark` points Tailwind's `dark:` variant at the attribute, not the OS. Use `dark:`
only where a token cannot express the difference — an image swap, a gradient direction, a blend
mode. **Colour belongs in the tokens.**

Charts are the one exception to "no literal colours": Recharts writes `fill=` / `stroke=` as SVG
presentation attributes, where `var()` is invalid and the browser drops it. Chart marks keep literal
hex with a comment naming the token they match. Chart containers, tooltips and legends are normal
DOM and do get tokens.

## Sonar / a11y rules that must not regress

From [.cursor/rules/sonarqube.mdc](.cursor/rules/sonarqube.mdc): no nested ternaries (S3358 —
use `if`/`else if`, notably for `describedBy` and field messages); `arr.at(-1)` over
`[length-1]`; no `aria-invalid` on `<button>` (use `aria-describedby` → `role="alert"`); custom
selects use `aria-haspopup`/`aria-expanded`/`aria-pressed`; no JSX handlers on `<dialog>`,
`<tr>`, or non-interactive divs; backdrop dismiss must be a real `<button>`; OTP inputs use
`<fieldset>`/`<legend>`.
