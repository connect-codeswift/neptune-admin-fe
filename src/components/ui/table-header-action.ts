/**
 * Shared sizing for action buttons in module table / register card headers.
 * Colours come from the Button variant (primary / secondary) — keep those as-is.
 *
 * Ported from `neptune-app-fe`'s `ui/table-header-action.ts` so the register
 * toolbars in both apps have the same footprint.
 */
export const TABLE_HEADER_ACTION_CLASS =
  "text8 shrink-0 gap-1 rounded-lg px-3 py-1.5 font-bold whitespace-nowrap md:gap-1.5 md:rounded-2.5 md:px-3.5 md:py-2 md:text5";

/** Same footprint for outline / secondary table-header actions. */
export const TABLE_HEADER_SECONDARY_ACTION_CLASS =
  "text8 shrink-0 gap-1 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap md:gap-1.5 md:rounded-2.5 md:px-3.5 md:py-2 md:text4 md:font-medium";

export const TABLE_HEADER_ACTION_ICON_CLASS = "size-3.5 shrink-0";
