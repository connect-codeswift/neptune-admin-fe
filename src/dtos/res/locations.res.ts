/**
 * Response shapes for `api/v1/locations`.
 *
 * Contract: `FEGuides/Locations.md` in `connect-codeswift/Neptune-Ehss-BE`. Not paginated —
 * `dataModel` is the full, name-ordered list.
 */

/** One site location. */
export type LocationResponse = {
  id: number;
  name: string;
};
