# Admin Dashboard — Frontend Guide

Everything the platform admin dashboard (`neptune-admin-fe`) needs, screen by screen.

**Controllers:** [`SuperAdminAuthController`](../Neptune/Controllers/SuperAdminAuthController.cs), [`SuperAdminCompaniesController`](../Neptune/Controllers/SuperAdminCompaniesController.cs), [`SuperAdminSitesController`](../Neptune/Controllers/SuperAdminSitesController.cs), [`SuperAdminUsersController`](../Neptune/Controllers/SuperAdminUsersController.cs), [`SuperAdminRolesController`](../Neptune/Controllers/SuperAdminRolesController.cs), [`SuperAdminDashboardController`](../Neptune/Controllers/SuperAdminDashboardController.cs)
**Base routes:** `api/SuperAdmin*`

Most of this guide is **authentication**, because this is the only surface in Neptune with three token types, a mandatory-MFA login, and a second token minted after login that changes which database the API talks to. Get that wrong and nothing else works.

---

# Part 1: Authentication

## 1.1 Two kinds of person use this dashboard

| Caller | Who | Logs in via | Passes authorization because |
|---|---|---|---|
| **SuperAdmin** | CodeSwift staff | `POST /api/SuperAdminAuth/login` | `purpose=superadmin-session` bypasses every permission check |
| **Tenant Admin** | The customer's own owner | `POST /api/Auth/login` | Holds the `Admin` role, which bypasses role and permission gates in their own tenant |

One frontend serves both. The difference is that the SuperAdmin flow has an extra step (picking a company) that the tenant Admin does not.

## 1.2 The token types

| Token | Minted by | Lifetime | Key claims |
|---|---|---|---|
| **SuperAdmin session** | `verify-mfa` or `mfa/enable` | **7 days** | `id`, `purpose=superadmin-session` |
| **SuperAdmin org session** | `select-company` | **8 hours** | above + `OrganizationName`, `SiteId` |
| **Tenant user session** | `/api/Auth/login` | `Jwt:AuthTokenDurationInMinutes` | `nameid`, `OrganizationName`, `SiteId`, `role`, one `Permission` per grant |

Plus short-lived **purpose tokens** that are not sessions and must never be stored as one: MFA challenge (5 min) and SuperAdmin MFA *setup* (15 min).

**The org token is what makes the API talk to the customer's database.** Without it, every company-scoped call fails with `"Tenant database is not resolved. Please login first."`

Your `axiosInstance` already prefers it, which is correct:

```ts
const token = orgToken || authToken;
```

## 1.3 SuperAdmin login: MFA is mandatory, two branches

`POST /api/SuperAdminAuth/login` **never returns a session token.**

```
POST /api/SuperAdminAuth/login   { email, password }
   │
   ├─ { mfaRequired: true, mfaToken }        → already enrolled
   │     POST /verify-mfa   { mfaToken, code }
   │        → { accessToken }                  ← store as neptune_admin_auth_token
   │
   └─ { mfaSetupRequired: true, mfaToken }   → first login
         POST /mfa/setup    { mfaToken }
            → { mfaSecret, otpAuthUri }       ← render otpAuthUri as a QR
         POST /mfa/enable   { mfaToken, code }
            → { accessToken, mfaEnabled: true }
```

- **The same `mfaToken` is used for both `mfa/setup` and `mfa/enable`.** Do not discard it after setup. 15 minutes total.
- The secret is regenerated on every `mfa/setup` call, deliberately, so an abandoned attempt leaves nothing reusable. A page reload invalidates a scanned QR.
- `mfa/enable` issues the session directly; the password was already proven at login.
- Both MFA steps re-check that the account is still active, because a 15-minute token outlives a deactivation.

**Bootstrap:** the seeded `superadmin@codeswift.org` ships with a null password hash. First password is set via `POST /bootstrap` with `{ email, password, bootstrapKey }`. One-shot; refuses once a hash exists. Put it behind a hidden route.

## 1.4 Password reset — NEW

Backs the `(auth)/forgot-password` and `(auth)/reset-password` screens. Both endpoints are unauthenticated.

### `POST /api/SuperAdminAuth/forgot-password`

```json
{ "email": "someone@codeswift.org" }
```

Emails a 6-digit OTP, valid **15 minutes**.

**The response is identical whether or not the account exists.** Same status, same message, every time. This is deliberate: staff accounts reach every customer's database, so the endpoint must not confirm which emails are real. **Do not build UI that implies otherwise** — no "we couldn't find that email" state, because the API will never tell you that. Show "if an account exists, a code has been sent" and move to the code screen regardless.

Requesting a new OTP replaces any previous one and resets the attempt budget.

### `POST /api/SuperAdminAuth/reset-password`

```json
{ "email": "...", "otp": "123456", "newPassword": "..." }
```

- `otp` must be exactly 6 numeric digits (rejected by model validation otherwise).
- `newPassword` minimum 8 characters, enforced in the service so it comes back in the **standard envelope**, not the framework's ModelState shape.

On success: `success: true`, a message, and **`dataModel` is null**.

**There is no token in the response, by design.** A password reset must not sidestep the authenticator. After a successful reset, send the user back to the login screen; they will still be challenged for MFA exactly as before.

**Every failure returns one indistinguishable message**, `"Invalid or expired verification code."` with 400 — wrong OTP, expired OTP, no OTP requested, unknown email, deactivated account, and too many attempts all look identical. Do not try to branch on it.

**Guesses are capped at 5 per issued OTP.** Once exhausted, further attempts fail even with the right code until a new OTP is requested. Offer a "resend code" affordance, because that is the only way out.

## 1.5 Selecting a company

```
GET  /api/SuperAdminCompanies                        → organizations
GET  /api/SuperAdminCompanies/{organizationId}/sites → its sites
POST /api/SuperAdminAuth/select-company              { organizationId, siteId }
   → dataModel: { accessToken }                       ← store as neptune_admin_org_token
```

The backend validates the site actually belongs to the company, so do not trust that pairing client-side.

Read `dataModel.accessToken`. Your current `selectCompany()` probes for `token / accessToken / orgToken / Token` and a bare-string `dataModel`; only `accessToken` is ever produced, so that can be simplified.

**The org token lasts 8 hours while the base token lasts 7 days.** A tab left open overnight has a valid session and a dead company selection. **Treat a 401 on a company-scoped call as "re-pick the company", not "log out."** Bouncing an authenticated user to the login screen is the obvious bug here.

## 1.6 Tenant Admin login

```
POST /api/Auth/login   { email, password }
   ├─ { mfaRequired: true, mfaToken }  → POST /api/Auth/verify-mfa
   └─ { accessToken, refreshToken, mfaEnabled, mfaPromptDismissed,
        accessDaysRemaining?, accessExpiresAt? }
```

- **MFA is optional here.** When `mfaEnabled` and `mfaPromptDismissed` are both false, offer setup; `POST /api/Auth/mfa/dismiss` records a decline.
- There is a refresh token (`POST /api/Auth/refresh-token`). The SuperAdmin flow has none, hence its 7-day session.
- SSO at `POST /api/Auth/sso` with `{ provider, idToken }`, `"Microsoft"` or `"Google"`. **Sign-in only, never sign-up** — an unknown email is rejected rather than provisioned.
- `accessDaysRemaining` / `accessExpiresAt` appear only when the company has a time-boxed access window. See [CompanyAccessWindow.md](./CompanyAccessWindow.md).

A tenant Admin never calls `select-company`; their token already carries `OrganizationName` and `SiteId`. Hide the company dropdown for them.

## 1.7 How authorization is decided

`PermissionHandler` short-circuits twice before checking claims:

```csharp
if (context.User.FindFirstValue("purpose") == "superadmin-session") { Succeed(); return; }
if (context.User.IsInRole(nameof(AppRole.Admin)))                   { Succeed(); return; }
```

`AdminRoleBypassHandler` does the same for `[AuthorizeRoles]`.

**A SuperAdmin org token carries no role or permission claims at all.** Do not gate navigation on permission claims in this dashboard — for staff there are none to read, and for an Admin they are irrelevant. **Gate on "is there an org token yet."**

Neither bypass affects *which database* you reach. Tenant scoping comes from `OrganizationName`/`SiteId` and is untouched by authorization.

## 1.8 The response envelope

```json
{ "isError": false, "success": true, "statusCode": 200,
  "message": "…", "dataModel": { }, "errorDetails": null }
```

Check `success`, read `dataModel`. Note `statusCode` is lowercase in JSON. Errors come back in the same envelope.

---

# Part 2: The screens

## 2.1 Company picker

Section 1.5. Until an org token exists, the rest of the dashboard has no database to talk to.

`GET /api/SuperAdminCompanies?search=&pageNumber=1&pageSize=10` returns `{ data, totalRecords, pageNumber, pageSize }`, each row: `id, name, activatedModules, createdAt, updatedAt, siteCount, userCount, accessExpiresAt, daysRemaining`.

## 2.2 Client account detail — Overview and Modules tabs — NEW

### `GET /api/SuperAdminCompanies/{organizationId}`

SuperAdmin session required (403 otherwise). 404 if the company does not exist.

```json
{
  "id": 12, "name": "Acme", "code": "ACM",
  "industry": "Manufacturing", "legalName": "Acme Industries Ltd",
  "website": "https://acme.com", "employeeCount": 450,
  "complianceZone": "OSHA",
  "primaryContactName": "Dana Reed", "primaryContactTitle": "EHS Director",
  "primaryContactEmail": "dana@acme.com", "primaryContactPhone": "+1…",
  "activatedModules": "Incident,Hazard", "createdAt": "…", "updatedAt": "…",
  "siteCount": 3, "userCount": 27,
  "accessExpiresAt": null, "daysRemaining": null
}
```

### `PUT /api/SuperAdminCompanies/{organizationId}`

**Partial update.** Send only what changed:

```json
{ "industry": "Manufacturing" }
```

Everything else is untouched. Returns the full updated profile.

Two limits you must design around:

1. **You cannot clear a field back to null.** Omitted and explicitly-null are indistinguishable on the wire, so sending `{"website": null}` is a no-op, not an erase. If a user clears the website box, you can only write `""`, not null.
2. **`name: ""` is rejected with 400.** Everything else accepts any value within its max length.

Max lengths: name/legalName/primaryContactName 150, website 250, code 50, industry/complianceZone/primaryContactTitle 100, primaryContactEmail 150, primaryContactPhone 50. `primaryContactEmail` is format-checked **only when sent** — it is display data, not a login, so it never becomes required.

**Renaming a company does NOT rename its tenant database.** The database is named after the organization name at creation only. A renamed company keeps its original database name forever. Nothing breaks, but do not present the rename as if it re-homes anything.

### `PUT /api/SuperAdminCompanies/{organizationId}/modules`

```json
{ "activatedModules": "Incident,Hazard,PPE" }
```

**Full replace, not a partial update.** Send the complete list. Null or omitted collapses to an empty string, meaning no modules.

This is also now honoured at sign-up: `POST /Auth/register` accepts `activatedModules` and persists it. It previously discarded the value.

## 2.3 Client account detail — Sites tab — NEW

`api/SuperAdminSites`. Reachable by a SuperAdmin org-session token **or** a tenant Admin. Reads need `AdminPortal.Sites.View`, writes need `AdminPortal.Sites.Manage`; both are seeded and granted to `Admin` and `Primary_Admin`.

Scoped to the organization behind your token. **You never send an organization id.**

| Method | Route | Notes |
|---|---|---|
| GET | `/` | `?includeDeleted=false` by default |
| GET | `/{siteId}` | |
| POST | `/` | `siteName` + `location` required |
| PUT | `/{siteId}` | partial, nullable-means-omitted |
| DELETE | `/{siteId}` | soft delete |

Row shape: `id, siteName, location, industryType, siteSize, timeZoneId, isDrop, userCount`.

Behaviours to build around:

- **Deleted sites are excluded by default.** Pass `includeDeleted=true` to show them; use `isDrop` to style them.
- **A site from another organization returns 404, not 403.** Do not render a "no access" state for it — as far as this API is concerned it does not exist.
- **Deletion is refused while users are assigned.** 400, with the count in the message: *"Cannot delete this site: 3 user(s) are still assigned to it. Reassign or deactivate them first."* Surface that message directly; it tells the user exactly what to do. Consider disabling delete when `userCount > 0` rather than letting them discover it.
- **Deleting twice succeeds both times.** Safe to retry.
- Blank `siteName` or `location` on create is a 400.
- `timeZoneId` is a free-text IANA id (`"America/Chicago"`). Nothing validates it server-side yet.

## 2.4 Company dashboard — NEW

`api/SuperAdminDashboard`. Same gating as Sites; permission `AdminPortal.Dashboard.View`.

### `GET /summary`

One call, everything the cards need:

```json
{
  "users":  { "total": 27, "active": 21, "pendingSetup": 4, "suspended": 2 },
  "sites":  { "total": 3 },
  "roles":  { "total": 9, "custom": 2 },
  "access": { "expiresAt": null, "daysRemaining": null, "isPermanent": true },
  "activatedModules": { "modules": "Incident,Hazard", "moduleCount": 2 },
  "organization": { "id": 12, "name": "Acme", "createdAt": "…" }
}
```

- The four user counts use the **exact same definitions** as `GET /api/SuperAdminUsers/stats`, so the dashboard and the Users screen can never disagree. Active = not dropped and has a password; Pending setup = not dropped, no password yet; Suspended = dropped.
- `roles.total` counts roles visible to this company (shared system roles plus its own); `roles.custom` is just its own.
- `moduleCount` is 0 when the string is null or empty.

**A brand-new company returns 200 with zeros and nulls**, never a 404 and never null counts. Build the empty state against that, not against an error.

### `GET /recent-activity?limit=20`

Newest-first merged feed. `limit` is clamped to 1–100 (0 and 500 are clamped, not errors).

```json
[ { "type": "AccessWindow", "description": "…", "occurredAt": "…", "actor": "Ahad" } ]
```

`type` is `"AccessWindow"` or `"UserInvited"`. Empty array for a new company, never null.

**Known gap:** `actor` is always `null` for `UserInvited` rows, because invites are created with `InvitedBy = null`. Do not build a UI that depends on showing who invited someone; fall back to the description.

## 2.5 User management

`api/SuperAdminUsers` — unchanged, already complete.

```
GET  /?siteId=&search=&pageNumber=1&pageSize=50
GET  /stats?siteId=
GET  /{userId}
POST /invite       { email, fullName?, roleId, siteId? }
PUT  /{userId}     { fullName?, contactNo?, roleId?, siteId? }
PUT  /{userId}/status?isDrop=true|false
```

Row: `id, fullName, email, contactNo, profileUrl, roleId, roleName, siteId, siteName, siteLocation, isDrop, isInvited, mfaEnabled, createdAt, status`.

- Company-wide by default, narrowed by optional `siteId`.
- Deactivated users are **included**, flagged Suspended. Use the status column, don't filter client-side.
- Update is partial. **Email is deliberately not editable** — it is the login identifier and is referenced by refresh tokens and invites. Render it read-only.
- `invite` defaults `siteId` to the currently selected site.

## 2.6 Roles and rights

`api/SuperAdminRoles` — unchanged, already complete.

```
GET  /                    GET /permissions           GET /with-permissions
POST /                    { roleName, description? }
PUT  /{roleId}/permissions  { permissionIds: number[] }
```

- `isSystem` is `OrganizationId == null`. The backend's intent is that **system roles are fully read-only in the FE** — no rename, no delete, no permission editing.
- Assigning permissions is a **full replacement**. Send the complete array.
- `usersAssigned` counts non-deactivated users in this org holding the role.

**If a customer reports a sudden 403 on a feature that used to work**, it is almost always a new `[HasPermission]` gate shipped without a backfill migration. Nothing you can fix from the frontend.

## 2.7 Document categories

```
GET    /api/Document/GetAllCategories      POST /api/Document/AddCategory
PUT    /api/Document/Category/{id}         DELETE /api/Document/Category/{id}
```

Only update and delete are admin-gated (`AdminPortal.DocumentCategories.Manage` + `Admin`).

## 2.8 PPE catalog

```
GET /api/ppe            GET /api/ppe/{id}         POST /api/ppe        DELETE /api/ppe/{id}
POST /api/ppe/inspection-checklist   GET /api/ppe/inspection-checklist/{ppeId}
POST /api/ppe/inspection-status
GET /api/ppe/kpi        GET /api/ppe/kpi-inventory
```

`PPEController` includes `Admin` in its class-level role list.

## 2.9 Subscription tab

See [CompanyAccessWindow.md](./CompanyAccessWindow.md) — grant/extend/clear a company's access window and read its audit history.

---

# Part 3: Practical notes

## 3.1 What to change in the current `auth.service.ts`

1. **Add the MFA branch.** `login()` assumes a token comes back; it never does. Every SuperAdmin login needs §1.3.
2. **Add forgot/reset** per §1.4, with no "email not found" state.
3. **Simplify `selectCompany()`** to read `dataModel.accessToken`.
4. **Distinguish the 8-hour org token from the 7-day session** (§1.5).
5. `register()` points at `/Auth/register`, which is the tenant company sign-up. Confirm it belongs in this app; if it does, it now accepts `activatedModules`.

## 3.2 Error handling

The axios interceptor currently flattens every error into a generic `Error`. Preserve the status, because 401 has three distinct meanings here: bad credentials, expired org token (re-pick company), expired base session (re-login). Attach `status` to the thrown error rather than only formatting it into the string.

## 3.3 Screens with no backend

- **LOTO procedures** and **Regulation library** have routes and nav entries but **no controller, service, entity or table exists**. They are frontend-only concepts today.
- **The Overview tab's employee-roster upload** (`{fileName, status, lastUpdated}`) has no backend; it needs file storage, not a column.
- **Contract/commercial fields** (plan type, seats, monthly value, assigned CSM) do not exist and are deferred until billing is designed. The Subscription tab has access/trial state and history only.
- **Notifications** have a complete backend (`api/notification`) and no frontend anywhere.

## 3.4 Local setup

`NEXT_PUBLIC_BACKEND_URL` is the API root **without** `/api` — `axiosInstance` appends it. Swagger at the API root is the fastest way to confirm a payload shape.
