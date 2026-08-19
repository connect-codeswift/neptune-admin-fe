"use client";

import type { PpeCategoryId } from "@/lib/dummy-ppe-catalog";
import { PPE_CATEGORIES } from "@/lib/dummy-ppe-catalog";

type PpeCategoryFilterProps = Readonly<{
  activeCategory: PpeCategoryId | "all";
  counts: Map<PpeCategoryId | "all", number>;
  onChange: (category: PpeCategoryId | "all") => void;
}>;

/**
 * The chips used to sit in a horizontally scrolling strip, so on a narrow
 * window the categories past "Hand Protection" were only reachable by dragging
 * a scrollbar-less row — a filter you cannot see is a filter nobody uses. They
 * wrap now, which is what the page's own rhythm does everywhere else.
 */
const PILL_BASE =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/30";
const PILL_IDLE =
  "border-ehs-border-ink/12 bg-ehs-surface/60 text-ehs-darker hover:border-ehs-border-ink/20 hover:bg-ehs-surface/80";
const PILL_ACTIVE =
  "border-ehs-normal-blue bg-ehs-normal-blue/12 font-semibold text-ehs-normal-blue";

const COUNT_BASE = "rounded-full px-1.5 text8 tabular-nums";
const COUNT_IDLE = "bg-ehs-border-ink/6 text-ehs-muted-text";
const COUNT_ACTIVE = "bg-ehs-normal-blue/15 text-ehs-normal-blue";

export function PpeCategoryFilter({
  activeCategory,
  counts,
  onChange,
}: PpeCategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter PPE items by category"
      className="flex flex-wrap gap-2"
    >
      {PPE_CATEGORIES.map((category) => {
        const active = activeCategory === category.id;
        const count = counts.get(category.id) ?? 0;

        let pillClass = `${PILL_BASE} ${PILL_IDLE}`;
        let countClass = `${COUNT_BASE} ${COUNT_IDLE}`;
        if (active) {
          pillClass = `${PILL_BASE} ${PILL_ACTIVE}`;
          countClass = `${COUNT_BASE} ${COUNT_ACTIVE}`;
        }

        return (
          <button
            key={category.id}
            type="button"
            className={pillClass}
            aria-pressed={active}
            onClick={() => onChange(category.id)}
          >
            {category.label}
            {/* The count is decoration on top of the label, so it is folded
                into the button's accessible name rather than read as a
                separate "12" after it. */}
            <span className={countClass} aria-hidden="true">
              {count}
            </span>
            <span className="sr-only">, {count} items</span>
          </button>
        );
      })}
    </div>
  );
}
