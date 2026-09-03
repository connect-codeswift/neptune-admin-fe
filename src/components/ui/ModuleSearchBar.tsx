"use client";

import { Icon } from "@iconify/react";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

export type ModuleSearchBarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label": string;
  /** Optional count shown opposite the field, e.g. "6 sessions". */
  resultLabel?: string;
  className?: string;
}>;

/**
 * Shared `max-w-md` search field used under module filter bars.
 * Ported from `neptune-app-fe`'s `ui/ModuleSearchBar.tsx`.
 */
export function ModuleSearchBar(props: Readonly<ModuleSearchBarProps>) {
  const {
    value,
    onChange,
    placeholder,
    "aria-label": ariaLabel,
    resultLabel,
    className = "",
  } = props;

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full max-w-md min-w-0">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-normal-blue pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={[
            FIELD_INPUT_LG_CLASS,
            "pl-9 [&::-webkit-search-cancel-button]:appearance-none",
            "[&::-webkit-search-decoration]:appearance-none",
            "[&::-webkit-search-results-button]:appearance-none",
            "[&::-webkit-search-results-decoration]:appearance-none",
          ].join(" ")}
        />
      </div>

      {resultLabel ? (
        <span className="text4 text-ehs-muted-text shrink-0">
          {resultLabel}
        </span>
      ) : null}
    </div>
  );
}
