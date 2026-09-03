/**
 * Request payloads for `api/v1/departments`.
 *
 * Contract: `FEGuides/Departments.md` in `connect-codeswift/Neptune-Ehss-BE`. The controller
 * takes a `DepartmentDto` — `{ "name": "…" }` — trimmed server-side, unique per site
 * case-insensitively, for both create and rename.
 */

/** POST /v1/departments */
export type AddDepartmentPayload = {
  name: string;
};

/** PUT /v1/departments/{id} — same shape as create; renaming is the only way to fix a typo. */
export type UpdateDepartmentPayload = {
  name: string;
};
