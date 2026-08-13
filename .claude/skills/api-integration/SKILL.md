---
name: api-integration
description: Wire a Neptune backend endpoint into the admin portal — DTO, service, React Query hook, feature component, and the correct token allowlist. Use whenever asked to connect an admin screen to an API, add an endpoint call, or replace dummy data with real data.
---

# Wiring an endpoint

```
FEGuides/AdminDashboard.md   (contract, in the backend repo)
   ↓
src/dtos/req/<domain>.req.ts   ·   src/dtos/res/<domain>.res.ts
   ↓
src/services/<domain>.service.ts        axios only
   ↓
src/hooks/use<Domain>.ts                React Query + exported query-key const
   ↓
src/components/features/<domain>/
```

## 1. Read the contract first

The API lives in `connect-codeswift/Neptune-Ehss-BE`; contracts live in its `FEGuides/` directory.
`AdminDashboard.md` covers every admin screen and all three token types; `RBAC.md` covers roles
and permissions; `CompanyAccessWindow.md` covers time-boxed company access.

`.docs/swagger.json` is the raw schema dump and is often thinner than reality — reads are
anonymous projections server-side, so the FEGuide is authoritative. If the endpoint is in
neither, ask the backend rather than guessing.

## 2. Decide which token the request needs — this is the step people miss

`src/lib/axiosInstance.ts` picks a token per request from URL allowlists:

| List | Behaviour |
| --- | --- |
| `BODY_CREDENTIAL_AUTH_PATHS` | credentials in the body, `Authorization` stripped |
| `MFA_BEARER_AUTH_PATHS` | sends the short-lived MFA token (sessionStorage) |
| `STAFF_ONLY_AUTH_PATHS` | must use the staff token even when an org token exists |
| *(default)* | `orgToken \|\| authToken` |

If your endpoint is staff-only, or part of login/MFA, **add its path to the right list**.
Forgetting this shows up as a confusing 401 or as a super admin's org token leaking into a
platform-level call.

## 3. DTOs

`src/dtos/req/<domain>.req.ts` — types end in `Payload`.
`src/dtos/res/<domain>.res.ts` — types end in `Response`.

Export a named type even when the API defines no schema: `export type XResponse = unknown`.
See `.cursor/rules/api-dtos.mdc`.

## 4. Service

`src/services/<domain>.service.ts`. Axios only, one exported function per endpoint, JSDoc'd with
the method and path:

```ts
/** GET /SuperAdminCompanies/{id}/sites */
export async function getCompanySites(companyId: number) {
  return axiosInstance.get<ApiResponse<SiteResponse[]>>(`/SuperAdminCompanies/${companyId}/sites`);
}
```

No React, no state, no toasts here.

## 5. Hook

`src/hooks/use<Domain>.ts`, `"use client"`. Unwrap the envelope with the helpers in
`src/lib/api-response.ts` — `assertApiSuccess` first, then `unwrapDataModel<T>` or
`unwrapList<T>` (which tolerates the `items` / `data` / `records` pagination shapes). Export the
query key as a const so mutations can invalidate it:

```ts
export const COMPANY_SITES_KEY = ["company-sites"] as const;
```

Convert backend shapes to view models in `src/lib/mappers/` when the component would otherwise
carry API field names.

## 6. Feature component

`src/components/features/<domain>/`. Named exports, barrel `index.ts`. It should never see
`.dataModel`, an axios instance, or a raw API field name. Use `inputs/` and `ui/` primitives —
check them before building a control; `ui/Modal` and `ui/ConfirmDialog` are real `<dialog>`
elements with listeners in `useEffect`, never JSX handlers.

## 7. Tenant awareness

Org-scoped screens live under `src/app/[company]/[site]/`. If the endpoint depends on the
selected tenant, the org token already carries it — read the URL segments and the cached context
in `src/lib/tenant-context.ts` rather than re-fetching. Site lists come from that cache
(`src/lib/org-sites.ts`), not from a request.

If the backend can reject a stale tenant, make sure the message is one `isOrgTokenReselectMessage`
recognises — that is what fires `neptune:org-token-reselect` and reopens the company/site picker.

## 8. Replacing dummy data

Before extending any `src/lib/dummy-*.ts` or `*.dummy.ts`, check whether a real service and hook
already exist. When you wire the real endpoint, delete the placeholder rather than leaving both
paths alive.

## 9. Verify

```bash
npm run lint
npm run build     # the real typecheck — there are no tests
```

Keep the Sonar/a11y rules in `.cursor/rules/sonarqube.mdc` green: no nested ternaries, no
`aria-invalid` on buttons, no JSX handlers on `<dialog>` or `<tr>`.
