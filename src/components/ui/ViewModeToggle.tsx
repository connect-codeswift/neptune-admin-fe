"use client";

import { Icon } from "@iconify/react";
import { TABLE_HEADER_ACTION_ICON_CLASS } from "./table-header-action";

export type ViewMode = "table" | "grid";

export type ViewModeToggleProps = Readonly<{
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  /** Names what is being switched, e.g. "users" — used in the accessible label. */
  itemLabel: string;
  className?: string;
}>;

const NEXT_MODE: Record<ViewMode, ViewMode> = {
  table: "grid",
  grid: "table",
};

const MODE_ICON: Record<ViewMode, string> = {
  table: "lucide:table",
  grid: "lucide:layout-grid",
};

/**
 * One button that swaps a register between table and card views.
 *
 * It shows the icon of the view it will switch **to**, not the one showing —
 * the same convention as a play/pause control, where the button names its
 * action. The accessible name says so outright ("Switch to grid view") so the
 * icon is never the only thing carrying that meaning, and `aria-pressed`
 * reports whether the non-default (grid) view is active.
 */
export function ViewModeToggle(props: ViewModeToggleProps) {
  const { value, onChange, itemLabel, className = "" } = props;
  const next = NEXT_MODE[value];
  const label = `Switch to ${next} view for ${itemLabel}`;

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-label={label}
      aria-pressed={value === "grid"}
      title={label}
      className={[
        "border-ehs-border text-ehs-darker bg-ehs-surface/80 hover:bg-ehs-surface-inverse/5",
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border shadow-sm",
        "focus-visible:border-ehs-normal-blue focus-visible:outline-none md:size-9 md:rounded-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon={MODE_ICON[next]}
        className={TABLE_HEADER_ACTION_ICON_CLASS}
        aria-hidden="true"
      />
    </button>
  );
}
