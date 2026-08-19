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
      "border-ehs-border-ink/8 bg-ehs-surface/55 text-ehs-darker backdrop-blur-1.25 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70";
    if (selected) {
      cardClass = "border-ehs-normal-blue bg-ehs-normal-blue/10 text-ehs-normal-blue";
    }

    return (
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={() => onToggle(option.value)}
        className={`cursor-pointer rounded-2.5 border px-4 py-3.5 text-left text4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:opacity-50 ${cardClass}`}
      >
        {option.label}
      </button>
    );
  }

  let badgeClass =
    "border-ehs-border-ink/12 bg-ehs-surface/55 text-ehs-gray backdrop-blur-1.25 hover:border-ehs-border-ink/22";
  if (selected) {
    badgeClass =
      "border-ehs-green/40 bg-ehs-green/10 text-ehs-darker hover:border-ehs-green/55";
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle(option.value)}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${badgeClass}`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
          selected
            ? "bg-ehs-green text-ehs-on-accent"
            : "bg-ehs-border-ink/25 text-ehs-surface"
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
      <p id={`${groupId}-error`} className="text8 text-red" role="alert">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={`${groupId}-helper`} className="text8 text-gray">
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

  // Both variants share the quiet field-label treatment used by every other control.
  const labelClass = "text7 text-darkest";

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
              <span className="text7 text-gray">{count}</span>
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
        <p className="text8 text-gray">{footerCountText}</p>
      ) : null}
    </fieldset>
  );
}
