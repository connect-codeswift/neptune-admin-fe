/**
 * Request payloads for `api/v1/locations`.
 *
 * Contract: `FEGuides/Locations.md` in `connect-codeswift/Neptune-Ehss-BE`. Create and rename
 * share the same body — the controller takes a `LocationDto` with a single `name` field,
 * trimmed and uniqueness-checked (case-insensitively) server-side, per site.
 */

/** Body for `POST /v1/locations` and `PUT /v1/locations/{id}`. */
export type LocationPayload = {
  name: string;
};
