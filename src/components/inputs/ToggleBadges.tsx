"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";

export type ToggleBadgeOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ToggleBadgesVariant = "chip" | "card";

export type ToggleBadgesProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: ToggleBadgeOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  /**
   * `chip` — permission-style badges with check/close icons (default).
   * `card` — selectable module tiles (teal outline, no status icons).
   */
  variant?: ToggleBadgesVariant;
  /** Show selected/total count. Defaults to true. */
  showCount?: boolean;
  /** Count of `selected` or total `options`. Defaults to `options` for chip, `selected` for card. */
  countMode?: "selected" | "options";
  /**
   * Where to render the count.
   * `legend` — top-right of label. `footer` — below options (e.g. "3 modules selected").
   */
  countPlacement?: "legend" | "footer";
  /** Noun for footer count, e.g. "modules selected" → "3 modules selected". */
  countNoun?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

type BadgeButtonProps = {
  option: ToggleBadgeOption;
  selected: boolean;
  disabled: boolean;
  variant: ToggleBadgesVariant;
  onToggle: (value: string) => void;
};

function BadgeButton({
  option,
  selected,
  disabled,
  variant,
  onToggle,
}: Readonly<BadgeButtonProps>) {
  if (variant === "card") {
    let cardClass =
      "border-darkest/12 bg-white text-darkest hover:border-darkest/20";
    if (selected) {
      cardClass = "border-blue-normal bg-blue-normal/10 text-blue-normal";
    }

    return (
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={() => onToggle(option.value)}
        className={`cursor-pointer rounded-[10px] border px-4 py-3.5 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-normal/30 disabled:cursor-not-allowed disabled:opacity-50 ${cardClass}`}
      >
        {option.label}
      </button>
    );
  }

  let badgeClass =
    "border-darkest/15 bg-white text-gray hover:border-darkest/25";
  if (selected) {
    badgeClass =
      "border-green/40 bg-green/10 text-darkest hover:border-green/55";
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle(option.value)}
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
}

function buildFieldMessage(
  groupId: string,
  error?: string,
  helperText?: string,
) {
  if (error) {
    return (
      <p id={`${groupId}-error`} className="text-xs text-red" role="alert">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={`${groupId}-helper`} className="text-xs text-gray">
        {helperText}
      </p>
    );
  }
  return null;
}

function resolveDescribedBy(
  groupId: string,
  error?: string,
  helperText?: string,
) {
  if (error) return `${groupId}-error`;
  if (helperText) return `${groupId}-helper`;
  return undefined;
}

export function ToggleBadges({
  id,
  label,
  helperText,
  error,
  options,
  value = [],
  onChange,
  variant = "chip",
  showCount = true,
  countMode,
  countPlacement,
  countNoun = "selected",
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<ToggleBadgesProps>) {
  const generatedId = useId();
  const groupId = id ?? generatedId;

  const resolvedCountMode =
    countMode ?? (variant === "card" ? "selected" : "options");
  const resolvedCountPlacement =
    countPlacement ?? (variant === "card" ? "footer" : "legend");

  const describedBy = resolveDescribedBy(groupId, error, helperText);
  const fieldMessage = buildFieldMessage(groupId, error, helperText);

  const count =
    resolvedCountMode === "selected" ? value.length : options.length;

  let footerCountText = `${count}`;
  if (resolvedCountPlacement === "footer") {
    footerCountText = `${count} ${countNoun}`;
  }

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange?.(value.filter((item) => item !== optionValue));
      return;
    }
    onChange?.([...value, optionValue]);
  };

  const showLegendCount = showCount && resolvedCountPlacement === "legend";
  const showFooterCount = showCount && resolvedCountPlacement === "footer";

  let optionsClass = `flex flex-wrap gap-2 ${className}`.trim();
  if (variant === "card") {
    optionsClass =
      `grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim();
  }

  let labelClass = "text-base font-bold text-darkest";
  if (variant === "card") {
    labelClass = "text-sm font-semibold text-darkest";
  }

  return (
    <fieldset
      className={`flex flex-col gap-3 border-0 p-0 ${containerClassName}`.trim()}
      aria-describedby={describedBy}
      disabled={disabled}
    >
      {label || showLegendCount ? (
        <legend className="float-none mb-0 w-full p-0">
          <span className="flex w-full items-center justify-between gap-3">
            {label ? (
              <span className={labelClass}>{label}</span>
            ) : (
              <span className="sr-only">Options</span>
            )}
            {showLegendCount ? (
              <span className="text-sm font-normal text-gray">{count}</span>
            ) : null}
          </span>
        </legend>
      ) : null}

      {fieldMessage}

      <div className={optionsClass}>
        {options.map((option) => (
          <BadgeButton
            key={option.value}
            option={option}
            selected={value.includes(option.value)}
            disabled={disabled || Boolean(option.disabled)}
            variant={variant}
            onToggle={toggleValue}
          />
        ))}
      </div>

      {showFooterCount ? (
        <p className="text-xs text-gray">{footerCountText}</p>
      ) : null}
    </fieldset>
  );
}
