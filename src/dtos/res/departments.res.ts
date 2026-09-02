/**
 * Response shapes for `api/v1/departments`.
 *
 * Contract: `FEGuides/Departments.md` in `connect-codeswift/Neptune-Ehss-BE`. Not paginated —
 * `dataModel` is the full, name-ordered list.
 */

/** One department. */
export type DepartmentResponse = {
  id: number;
  name: string;
};
