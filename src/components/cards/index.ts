/**
 * Grid-view cards for the registers.
 *
 * One card per table that offers a card view: each is the row of that table
 * rendered as a tile, and is what `ViewModeToggle` switches to. They live here
 * rather than under `features/<domain>/` because a card is a presentation of a
 * row, reusable by any screen that lists the same records — the domain's own
 * page composition stays in `features/`.
 *
 * The contract every card here follows:
 * - it takes the same view-model type the table's columns are built from;
 * - it reuses the `Table*` cell primitives (`TableUserCell`, `TableRoleBadge`,
 *   `TableStatusBadge`, `TableRowActions`) rather than restyling them, so
 *   switching view changes the layout and nothing else;
 * - it is `h-full` with an `mt-auto` footer, so a row of cards stays level.
 */
export { CARD_GRID_CLASS } from "./card-grid";
export { DepartmentCard, type DepartmentCardProps } from "./DepartmentCard";
export { LocationCard, type LocationCardProps } from "./LocationCard";
export { RoleCard, type RoleCardProps } from "./RoleCard";
export { UserCard, type UserCardProps } from "./UserCard";
