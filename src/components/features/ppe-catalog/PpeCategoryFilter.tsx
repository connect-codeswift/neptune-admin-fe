"use client";

import type { PpeCategoryId } from "@/lib/dummy-ppe-catalog";
import { PPE_CATEGORIES } from "@/lib/dummy-ppe-catalog";

type PpeCategoryFilterProps = Readonly<{
  activeCategory: PpeCategoryId | "all";
  counts: Map<PpeCategoryId | "all", number>;
  onChange: (category: PpeCategoryId | "all") => void;
}>;

export function PpeCategoryFilter({
  activeCategory,
  counts,
  onChange,
}: PpeCategoryFilterProps) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
      {PPE_CATEGORIES.map((category) => {
        const active = activeCategory === category.id;
        const count = counts.get(category.id) ?? 0;

        let pillClass =
          "shrink-0 cursor-pointer rounded-full border border-darkest/12 bg-white px-3.5 py-2 text5 text-darkest transition-colors hover:border-darkest/20";
        if (active) {
          pillClass =
            "shrink-0 cursor-pointer rounded-full border border-blue-normal bg-blue-normal/12 px-3.5 py-2 text5 font-semibold text-blue-normal";
        }

        return (
          <button
            key={category.id}
            type="button"
            className={pillClass}
            aria-pressed={active}
            onClick={() => onChange(category.id)}
          >
            {category.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
