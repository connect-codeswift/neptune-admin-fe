"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";

export type ToggleBadgeOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ToggleBadgesProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: ToggleBadgeOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Show count on the right of the label. Defaults to selected count. */
  showCount?: boolean;
  /** Count of `selected` or total `options`. */
  countMode?: "selected" | "options";
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

export function ToggleBadges({
  id,
  label,
  helperText,
  error,
  options,
  value = [],
  onChange,
  showCount = true,
  countMode = "options",
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<ToggleBadgesProps>) {
  const generatedId = useId();
  const groupId = id ?? generatedId;

  let describedBy: string | undefined;
  if (error) {
    describedBy = `${groupId}-error`;
  } else if (helperText) {
    describedBy = `${groupId}-helper`;
  }

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${groupId}-error`} className="text-xs text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${groupId}-helper`} className="text-xs text-gray">
        {helperText}
      </p>
    );
  }

  const count = countMode === "selected" ? value.length : options.length;

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange?.(value.filter((item) => item !== optionValue));
      return;
    }
    onChange?.([...value, optionValue]);
  };

  return (
    <fieldset
      className={`flex flex-col gap-3 border-0 p-0 ${containerClassName}`.trim()}
      aria-describedby={describedBy}
      disabled={disabled}
    >
      {label || showCount ? (
        <legend className="mb-0 w-full float-none p-0">
          <span className="flex w-full items-center justify-between gap-3">
            {label ? (
              <span className="text-base font-bold text-darkest">{label}</span>
            ) : (
              <span className="sr-only">Options</span>
            )}
            {showCount ? (
              <span className="text-sm font-normal text-gray">{count}</span>
            ) : null}
          </span>
        </legend>
      ) : null}

      <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
        {options.map((option) => {
          const selected = value.includes(option.value);
          const isDisabled = disabled || Boolean(option.disabled);

          let badgeClass =
            "border-darkest/15 bg-white text-gray hover:border-darkest/25";
          if (selected) {
            badgeClass =
              "border-green/40 bg-green/10 text-darkest hover:border-green/55";
          }

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={isDisabled}
              onClick={() => toggleValue(option.value)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${badgeClass}`}
            >
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                  selected ? "bg-green text-white" : "bg-darkest/20 text-white"
                }`}
                aria-hidden
              >
                <Icon
                  icon={selected ? "mdi:check" : "mdi:close"}
                  width={10}
                  height={10}
                />
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      {fieldMessage}
    </fieldset>
  );
}
