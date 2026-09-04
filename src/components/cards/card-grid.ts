/**
 * The one grid recipe every card view uses: 1 column, 2 from `lg`, 3 from `2xl`.
 *
 * It lives here rather than in each page so the registers cannot drift apart —
 * a card grid that is 2-up on one screen and 3-up on the next reads as a bug.
 * `stagger-cards` is the shared entry animation defined in `globals.css`.
 */
export const CARD_GRID_CLASS =
  "stagger-cards grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3";
