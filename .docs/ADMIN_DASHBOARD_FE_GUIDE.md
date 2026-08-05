# CodeSwift Admin Dashboard — Frontend Guide

Backend contract for the internal admin dashboard (the one where CodeSwift staff pick a
customer company from a dropdown and manage its EHS setup).

Backend PR: **#122** on `Neptune-Ehss-BE`, branch `feature/superadmin-auth` → `Staging`.
Swagger, once it's deployed: `{API_BASE}/swagger`.

**Field naming note (2026-08-04):** the backend went through a repo-wide
`Company`/`SubCompany` → `Organization`/`Site` rename (see
`Backend-Organization-Sites-Rename-Guide.md`). Every `subCompanyId`/`subCompanyName`/
`companyName`/`companySize`/`subCompId` field below is now `siteId`/`siteName`/`siteSize`
(this doc is already updated to match — if you're looking at an older copy, this line is
your signal to re-pull it).

**Read the "What does not exist yet" section before you start building screens.** Several
fields in the Figma designs have no backing data at all, and you'll want to know which ones
before you wire up a table.

---

## 1. The one thing to understand first: there are two tokens

Every customer company has its **own separate database**. A CodeSwift staff account doesn't
belong to any of them, so the backend can't tell which company you mean just from your login.

So the flow is two steps:

1. **Log in** (password **+ authenticator code — MFA is mandatory here**, see §1a) → you get a
   *staff token* (7 days). This gets you the company list and nothing else.
2. **Pick a company + site** → you exchange that for an *org token* (8 hours). This is scoped
   to one company, and it's the token you send for every actual data call.

The org token deliberately carries the same claims a normal customer's token does, which is
why the existing per-tenant endpoints (PPE, Documents, …) work with it unchanged.

```
POST /api/SuperAdminAuth/login          → mfaToken       (5m/15m) ── never a session token
POST /api/SuperAdminAuth/verify-mfa     → staffToken     (7d)     ── keep in memory/storage
POST /api/SuperAdminAuth/select-company → orgToken       (8h)     ── swap on every company change
        ↑ send staffToken                                           ── send orgToken for everything else
```

**Practical implications:**

- Keep both tokens. You need the staff token again every time the user switches company.
- The org token expires **sooner** (8h) than the staff token (7d). When a data call starts
  failing, re-issue `select-company` with the stored staff token before bouncing the user to login.
- Switching company = call `select-company` again and replace the org token. Nothing else to reset.
- If you send a staff token to a data endpoint you get a clean `400` with
  `"No company selected — call select-company first."` — that's your cue to re-select, not to log out.

## 1a. MFA is mandatory — plan for two login screens

Staff accounts reach every customer's data, so a password alone never produces a session
token. `POST /login` returns **one of two things**, and you branch on which:

| Login response | Meaning | Where you send the user |
|---|---|---|
| `{ "mfaRequired": true, "mfaToken": "…" }` | Enrolled. Just needs a code. | Code-entry screen |
| `{ "mfaSetupRequired": true, "mfaToken": "…" }` | First login, no authenticator yet. | Enrollment screen |

There is **no `accessToken` in either case** — don't write a happy path that expects one.

**Screen A — code entry** (`mfaRequired`). Six-digit numeric input, then:

```http
POST /api/SuperAdminAuth/verify-mfa
{ "mfaToken": "…from login…", "code": "123456" }

200 → { "accessToken": "eyJ..." }        ← this is the staff token
401 → invalid code / expired mfaToken / account deactivated
```

The `mfaToken` lives **5 minutes**. If they fumble past it, `verify-mfa` returns 401 and you
send them back to the password screen — you can't refresh it.

**Screen B — enrollment** (`mfaSetupRequired`). Two calls:

```http
POST /api/SuperAdminAuth/mfa/setup
{ "mfaToken": "…from login…" }

200 → { "mfaSecret": "NBDQ…U27",
        "otpAuthUri": "otpauth://totp/CodeSwift%20Admin:someone%40codeswift.org?secret=…" }
```

```http
POST /api/SuperAdminAuth/mfa/enable
{ "mfaToken": "…the SAME token from login…", "code": "123456" }

200 → { "accessToken": "eyJ...", "mfaEnabled": true }   ← straight into the app, no re-login
400 → "Call mfa/setup first." / "MFA is already enabled for this account."
401 → invalid code / expired token
```

Three things that will bite you if you don't plan for them:

- **`otpAuthUri` is a URI, not an image.** Render the QR client-side (`qrcode`, `qrcode.react`,
  whatever) from that string. Show `mfaSecret` underneath as the manual-entry fallback —
  desktop authenticators often can't scan.
- **Reuse the login `mfaToken` for both setup and enable.** `mfa/setup` doesn't mint a new one.
  This one lasts **15 minutes**, not 5 — installing an app takes longer than typing a code.
- **Calling `mfa/setup` twice issues a *new* secret** and invalidates the previous QR. That's
  deliberate. So don't call it on component re-render — call it once, when the enrollment
  screen opens, and hold the result in state.

Both MFA endpoints are unauthenticated in the `Authorization`-header sense — the `mfaToken`
in the body *is* the credential. Don't attach a bearer header to them.

**No self-service recovery.** Lost authenticator = a CodeSwift engineer clears the row by
hand. Don't build a "reset MFA" link; there's no endpoint behind it.

---

### Auth calls

**Login** — note this one is *not* wrapped in the standard envelope:

```http
POST /api/SuperAdminAuth/login
{ "email": "someone@codeswift.org", "password": "..." }

200 → { "mfaRequired": true,      "mfaToken": "eyJ..." }   ← enrolled → verify-mfa
200 → { "mfaSetupRequired": true, "mfaToken": "eyJ..." }   ← first login → mfa/setup
401 → invalid credentials / deactivated account
```

**Select company + site** — this one *is* wrapped:

```http
POST /api/SuperAdminAuth/select-company
Authorization: Bearer {staffToken}
{ "organizationId": 1, "siteId": 1 }

200 → { "dataModel": { "accessToken": "eyJ..." }, "message": "Switched to Local Dev Org", ... }
400 → "That site does not belong to the selected company."
```

The backend re-checks that the site really belongs to the company, so a mismatched pair is
rejected rather than silently trusted.

---

## 2. Response envelope

Almost every endpoint returns this shape (JSON is camelCase):

```jsonc
{
  "isError": false,
  "dataModel": { ... },      // the actual payload — array, object, or paginated wrapper
  "statusCode": 200,
  "success": true,
  "message": "Users fetched successfully",
  "errorDetails": null
}
```

Paginated endpoints put this inside `dataModel`:

```jsonc
{ "data": [ ... ], "totalRecords": 42, "pageNumber": 1, "pageSize": 50 }
```

### Error handling — three gotchas

1. **Business errors come back as HTTP 400 with `success: false`**, not as 200-with-error.
   Show `message` — it's written to be user-facing (`"Email already exists: x@y.com"`,
   `"This role does not belong to the selected company."`).

2. **Never render `errorDetails`.** It currently contains the full C# stack trace on every
   error response. That's a known backend issue, logged separately — just don't surface it.

3. **`401` vs `403` mean different things.** `401` = missing/expired/invalid token → send to
   login. `403` = the token is valid but isn't a staff session → this shouldn't happen in
   normal use; treat it as a bug, not as "session expired".

One inconsistency to be aware of: `POST /api/Auth/refresh-token` returns **500** instead of
401 for an invalid token. That's the customer-facing auth controller, not ours, and it's
flagged for a separate fix — just don't treat 500 there as a server outage.

---

## 3. Endpoints

### Company + site dropdowns — send the **staff token**

```http
GET /api/SuperAdminCompanies?search=&pageNumber=1&pageSize=10
```
```jsonc
// dataModel.data[]
{ "id": 1, "name": "Local Dev Org", "activatedModules": "Incident,Hazard,CAPA",
  "createdAt": "...", "updatedAt": "...", "siteCount": 1, "userCount": 3 }
```

`search` filters on company name. Paginated.

```http
GET /api/SuperAdminCompanies/{organizationId}/sites
```
```jsonc
// dataModel is a plain array (not paginated)
{ "id": 1, "siteName": "Local Dev Co", "location": "Local",
  "industryType": "General", "siteSize": "Small", "userCount": 3 }
```

This is the second dropdown. Load it after the user picks a company.

---

### Users — send the **org token**

```http
GET /api/SuperAdminUsers?siteId=&search=&pageNumber=1&pageSize=50
```
```jsonc
// dataModel.data[]
{
  "id": 1004,
  "fullName": "New Invitee",           // nullable
  "email": "newinvite@example.com",
  "contactNo": "",                     // nullable
  "profileUrl": null,
  "roleId": 2, "roleName": "Ehs_Manager",
  "siteId": 1, "siteName": "Local Dev Co", "siteLocation": "Local",
  "isDrop": false, "isInvited": true, "mfaEnabled": false,
  "createdAt": "2026-07-30T00:41:12.9",
  "status": "Pending"                  // "Active" | "Pending" | "Suspended"
}
```

**The list is company-wide by default**, spanning every site — that matches the design header
("N users across all departments and sites") and the SITE column showing several sites at once.
`?siteId=` narrows it to one site, so wire the site dropdown as a *filter*, not as a
hard scope.

**Deactivated users are included**, flagged `status: "Suspended"`. This is deliberate: the
design shows Suspended rows and counts them in a KPI card, and if they were hidden there'd be
no way to reactivate anyone.

`status` is derived, not stored:
- `Suspended` — `isDrop` is true (takes priority over everything).
- `Pending` — invited but has never set a password.
- `Active` — everything else.

```http
GET /api/SuperAdminUsers/stats?siteId=
→ dataModel: { "totalUsers": 4, "active": 1, "pendingSetup": 2, "suspended": 1 }
```

The four KPI cards. Computed server-side, so the numbers stay right regardless of which page
of the table is loaded — **don't compute these from the current page**. `active + pendingSetup
+ suspended` always equals `totalUsers`.

```http
GET  /api/SuperAdminUsers/{id}          → same object shape as a list row (the eye action)
POST /api/SuperAdminUsers/invite        → { "email", "fullName"?, "roleId", "siteId"? }
PUT  /api/SuperAdminUsers/{id}          → { "fullName"?, "contactNo"?, "roleId"?, "siteId"? }
PUT  /api/SuperAdminUsers/{id}/status?isDrop=true|false
```

**Invite** — email is lower-cased and must be globally unique across *all* companies (login
looks users up by email alone, so a duplicate would make one account unreachable). `siteId`
defaults to the currently selected site; pass it to invite straight into a different site of
the same company. The invited user is created with no password → shows as `Pending`.

**Update** — every field is optional; only what you send changes. **Email is not editable** —
it's the login identifier.

**Status** — this is the "delete" action. There is **no hard delete**; it's a reversible
deactivate. Word your confirmation dialog accordingly ("Deactivate this user?" reads better
than "Delete"), and make sure the UI offers a way back, since suspended users stay listed.

Deactivating genuinely cuts off access now: the account can't log in, and its refresh tokens
are revoked immediately. There's a short tail where an already-issued access token keeps
working until it expires — worth knowing, but nothing you need to handle.

---

### Roles & permissions — send the **org token**

```http
GET /api/SuperAdminRoles?pageNumber=1&pageSize=50
```
```jsonc
// dataModel.data[]
{ "id": 2002, "roleName": "Site Auditor Custom", "description": null,
  "permissionCount": 3, "isSystem": false, "usersAssigned": 1 }
```

**`isSystem` is the one to branch on.** System roles (`Admin`, `Primary_Admin`, `Ehs_Manager`,
`Ehs_Director`, `Ehs_Analyst`, `Ehs_Associate`, `Manager`) are shared by every company — the
whole app's authorization depends on them existing everywhere by name, so they are **read-only
here**. Hide or disable the edit affordance when `isSystem` is true; the API will reject the
write anyway with `"This role does not belong to the selected company."`

Use **`/SuperAdminRoles/*`** for this dashboard — not `/Auth/*`.

`isSystem` maps directly to the design's **Type: System / Custom** row, and `usersAssigned` to
**Users assigned**, in the Role Summary panel.

```http
GET /api/SuperAdminRoles/permissions
```
```jsonc
// dataModel — plain array, the full catalog
{ "id": 7, "displayName": "View PPE", "categoryId": 3, "categoryName": "PPE" }
```

The permission catalog is **global and fixed** — it's the software's own feature set, identical
for every company, not something a tenant customises. Group the checkboxes by `categoryName`;
that gives you the grouped layout and the per-category counts in the design's Summary panel.

⚠️ **Render these from the API, don't hardcode the chips in the mockup.** The real catalog is
currently 22 permissions across 6 categories (Audits & Inspections, EHS Command Center, HazCom,
Incident, PPE, Proactive Safety) and the names don't match the design's placeholder labels
("View Dashboard", "Export Reports", …). It also grows as backend modules ship.

```http
GET /api/SuperAdminRoles/with-permissions
```
Every visible role with its full permission list — use this for the role detail screen and for
the design's **"Start from Preset"** panel (copy another role's `permissions` into the form).

```http
POST /api/SuperAdminRoles                       → { "roleName", "description"? }
PUT  /api/SuperAdminRoles/{roleId}/permissions  → { "permissionIds": [1, 2, 3] }
```

**Creating a role with permissions is two calls**, in this order: `POST` to create, then `PUT`
using the returned `id`. There's no single create-with-permissions call. Handle a failure on
the second call — you'd be left with an empty role.

`PUT permissions` is a **full replace**, not a patch. Send the complete set every time; an
empty array clears them. Unknown permission ids are rejected with a 400.

Role names only need to be unique **within a company** — two different companies can each have
their own "Site Auditor". A company's custom roles are invisible to every other company; system
roles appear for everyone with the same ids.

There is **no delete-role endpoint**. If the designs need one, flag it.

---

### Document categories, departments, PPE — send the **org token**

These are existing customer-facing endpoints that already work through the org token unchanged.
Shapes are owned by those modules; check Swagger for the full detail.

```http
GET  /api/Document/GetAllCategories     → [{ "id", "categorytName", "siteId" }]
POST /api/Document/AddCategory          → { "categorytName": "Policy" }   ← siteId is set server-side, not sent
GET  /api/Document/GetAllDepartments    → [{ "id", "departmentName", "siteId" }]
POST /api/Document/AddDepartment        → { "departmentName": "Safety" }  ← siteId is set server-side, not sent
GET  /api/Document/dashboard-kpis
GET  /api/Document/category-stats
POST /api/Document/allDocuments         → document list (filters in body)
GET  /api/ppe?pageNumber=1&pageSize=10
POST /api/ppe
```

⚠️ **`categorytName` is spelled exactly like that** — a typo in the existing schema, not in this
document. Use it verbatim or your request silently fails validation.

---

## 4. What does not exist yet

Everything below is in the Figma designs but has **no backing data**. Please don't build the UI
around it expecting the API to catch up quietly — each needs a schema change on a shared table
or a module that hasn't been written yet.

### User Management screen
| Design element | Status |
|---|---|
| **DEPARTMENT** column | ❌ `User` has no department field at all. The only "department" in the system belongs to Documents, not people. |
| **LAST LOGIN** column | ❌ Never recorded anywhere. |
| **Import / Export** buttons | ❌ No endpoints. |
| Trainings in the user detail view | ❌ Training data lives in a *different database* to users, so this is a cross-database read that needs a design decision first. Keeping it in the design is fine — just don't expect an API this round. |

### Roles & Permissions screen
| Design element | Status |
|---|---|
| Role **Created** / **Last modified** dates | ❌ `Role` has no timestamps. |
| Permission chip names | ⚠️ Real ones differ from the mockup — render from the API. |
| Delete a role | ❌ No endpoint. |

### Document Categories screen
`DocCategory` now includes `categorytName`, `description`, `color`, `slug`, `isRequired`,
`requiresApprovalWorkflow`, `retentionDays`, and `documentCount`. Full CRUD is available via:

```http
GET    /api/Document/GetAllCategories
POST   /api/Document/AddCategory
PUT    /api/Document/Category/{id}
DELETE /api/Document/Category/{id}
```

⚠️ **`categorytName` is spelled exactly like that** — use it verbatim in request bodies.

### Version History, Regulations Library, LOTO Procedures, Permit Templates
❌ Not built. These modules don't exist in the backend yet and are owned by other devs — the
version history table, diff view and rollback in the designs have nothing behind them.

### PPE Catalog screen
Partially supported, and **less than the design assumes**. The `PPE` record has: stock level,
min stock, unit cost, a free-text `category`, supplier, replace-after, inspection interval,
available size, and a computed `stockStatus` (`InStock` / `LowStock` / `OutStock`).

It does **not** have: an item name, model number, manufacturer, safety standard (ANSI/NIOSH…),
hazard types, or a "training required" flag. The category filter chips in the design would be
filtering on a free-text string, not a real category list. Worth a conversation before building
this screen.

---

## 5. Quick reference

| Screen | Calls |
|---|---|
| Login | `POST /SuperAdminAuth/login` |
| Company dropdown | `GET /SuperAdminCompanies` |
| Site dropdown | `GET /SuperAdminCompanies/{orgId}/sites` |
| On company/site pick | `POST /SuperAdminAuth/select-company` → store org token |
| User Management | `GET /SuperAdminUsers` + `GET /SuperAdminUsers/stats` |
| View user | `GET /SuperAdminUsers/{id}` |
| Add user | `POST /SuperAdminUsers/invite` |
| Edit user | `PUT /SuperAdminUsers/{id}` |
| Deactivate/reactivate | `PUT /SuperAdminUsers/{id}/status?isDrop=` |
| Roles list | `GET /SuperAdminRoles` |
| Role detail | `GET /SuperAdminRoles/with-permissions` |
| Permission checkboxes | `GET /SuperAdminRoles/permissions` |
| Create role | `POST /SuperAdminRoles` then `PUT /SuperAdminRoles/{id}/permissions` |
| Save role permissions | `PUT /SuperAdminRoles/{id}/permissions` |
| Document categories | `GET /Document/GetAllCategories`, `POST /Document/AddCategory`, `PUT /Document/Category/{id}`, `DELETE /Document/Category/{id}` |
| PPE catalog | `GET|POST /ppe` |

**The five things that will trip you up:**

1. Two tokens — staff token for company/site pickers, org token for everything else.
2. Org token expires in 8h; re-run `select-company` rather than forcing a re-login.
3. `400 "No company selected"` means re-select the company, not log out.
4. Creating a role with permissions is two calls.
5. `categorytName` really is spelled that way.

Anything ambiguous, or a shape that doesn't match what you're actually getting back — ask
before working around it.
