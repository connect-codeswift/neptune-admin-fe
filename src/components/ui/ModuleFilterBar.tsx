"use client";

import { useId } from "react";
import { Icon } from "@iconify/react";

/**
 * Shared sizing for action buttons in module table / register card headers.
 * Colors come from the Button variant (primary / tertiary) — keep those as-is.
 *
 * Ported inline from `neptune-app-fe`'s `ui/table-header-action.ts`, which does
 * not exist in this repo. Keep byte-identical to that source if it changes.
 */
const TABLE_HEADER_ACTION_CLASS =
  "text8 shrink-0 gap-1 rounded-lg px-3 py-1.5 font-bold whitespace-nowrap md:gap-1.5 md:rounded-2.5 md:px-3.5 md:py-2 md:text5";

/** Same footprint for outline / tertiary table-header actions. */
const TABLE_HEADER_SECONDARY_ACTION_CLASS =
  "text8 shrink-0 gap-1 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap md:gap-1.5 md:rounded-2.5 md:px-3.5 md:py-2 md:text4 md:font-medium";

const TABLE_HEADER_ACTION_ICON_CLASS = "size-3.5 shrink-0";

export type ModuleFilterOption = Readonly<{
  value: string;
  label: string;
  /** Optional tally shown after the label. Omitted renders exactly as app-fe does. */
  count?: number;
}>;

export type ModuleFilterSegment = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Prefer `{ value, label }`; plain strings use the same text for both. */
  options: readonly ModuleFilterOption[] | readonly string[];
  disabled?: boolean;
}>;

export type ModuleFilterAction = Readonly<{
  label: string;
  onClick: () => void;
  icon?: string;
  disabled?: boolean;
  title?: string;
}>;

export type ModuleFilterBarProps = Readonly<{
  segments: readonly ModuleFilterSegment[];
  /** Primary CTA (e.g. New CAPA) — blue solid. */
  action?: ModuleFilterAction;
  /** Optional secondary CTA (e.g. My CAPAs) — sits left of primary. */
  secondaryAction?: ModuleFilterAction;
  /** Optional meta text rendered before the action group (e.g. "9 of 9"). */
  meta?: string;
  className?: string;
}>;

const shellClass =
  "flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-ehs-surface/60 px-4 py-3 shadow-md sm:px-5";

function toOptions(
  options: ModuleFilterSegment["options"],
): readonly ModuleFilterOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

function optionSelectLabel(option: ModuleFilterOption): string {
  return option.count === undefined
    ? option.label
    : `${option.label} (${option.count})`;
}

function FilterSegment(props: Readonly<ModuleFilterSegment>) {
  const { label, options, value, onChange, disabled = false } = props;
  const normalized = toOptions(options);
  const selectId = useId();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <label
        id={`${selectId}-label`}
        htmlFor={selectId}
        className="text6 text-ehs-muted-text shrink-0 xl:pointer-events-none"
      >
        {label}
      </label>

      <div className="relative min-w-0 flex-1 xl:hidden">
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className={[
            "border-ehs-border text4 text-ehs-dark-bg bg-ehs-surface/60 min-h-9 w-full min-w-36 cursor-pointer appearance-none rounded-lg border py-1.5 pr-8 pl-2.5 outline-none",
            "focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15 hover:bg-ehs-surface-inverse/5",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {normalized.map((option) => (
            <option
              key={option.value === "" ? `${label}-all` : option.value}
              value={option.value}
            >
              {optionSelectLabel(option)}
            </option>
          ))}
        </select>
        <Icon
          icon="mdi:chevron-down"
          className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>

      {/* The visible label is tied to the <select> below xl; at xl the select is
          hidden and the pills take over, so the group borrows the same label to
          keep an accessible name. Without this the pills are an unnamed pile of
          buttons — which is what the panel this replaced avoided with its own
          role="group". */}
      <div
        role="group"
        aria-labelledby={`${selectId}-label`}
        className="border-ehs-border bg-ehs-surface/60 hidden flex-wrap items-center gap-1 rounded-lg border px-1 py-1 xl:flex"
      >
        {normalized.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value === "" ? `${label}-all` : option.value}
              type="button"
              // These pills are toggles, and the only cue that one is chosen is
              // the inverted fill — which a screen reader cannot see. The app-fe
              // source omits this; the panel this replaced carried it, so
              // dropping it would have been a quiet regression.
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={[
                "text4 cursor-pointer rounded-md px-2 py-1 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "bg-ehs-surface-inverse text-ehs-surface-inverse-text"
                  : "text-ehs-gray hover:bg-ehs-surface-inverse/5",
              ].join(" ")}
            >
              {option.label}
              {option.count === undefined ? null : (
                <span
                  className={[
                    "ml-1 tabular-nums",
                    isActive
                      ? "text-ehs-surface-inverse-text/70"
                      : "text-ehs-muted-text",
                  ].join(" ")}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Shared module filter strip — Filters chip + segments + optional CTAs.
 * Below `xl`, segments render as select dropdowns; from `xl` up they use pills.
 * Ported from `neptune-app-fe`'s `ui/ModuleFilterBar.tsx`.
 */
export function ModuleFilterBar(props: Readonly<ModuleFilterBarProps>) {
  const { segments, action, secondaryAction, meta, className = "" } = props;
  const hasActions = Boolean(action || secondaryAction || meta);

  return (
    <div className={[shellClass, className].filter(Boolean).join(" ")}>
      {segments.map((segment) => (
        <FilterSegment key={segment.label} {...segment} />
      ))}

      {hasActions ? (
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
          {meta ? (
            <span className="text4 text-ehs-muted-text shrink-0 tabular-nums">
              {meta}
            </span>
          ) : null}

          {secondaryAction ? (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              title={secondaryAction.title}
              className={[
                "border-ehs-border text-ehs-darker bg-ehs-surface/80 hover:bg-ehs-surface-inverse/5 inline-flex min-h-9 cursor-pointer items-center justify-center border shadow-sm",
                "disabled:cursor-not-allowed disabled:opacity-50",
                TABLE_HEADER_SECONDARY_ACTION_CLASS,
              ].join(" ")}
            >
              <Icon
                icon={secondaryAction.icon ?? "mdi:account-outline"}
                className={TABLE_HEADER_ACTION_ICON_CLASS}
                aria-hidden="true"
              />
              {secondaryAction.label}
            </button>
          ) : null}

          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.title}
              className={[
                "bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active inline-flex min-h-9 cursor-pointer items-center justify-center shadow-sm",
                "disabled:cursor-not-allowed disabled:opacity-50",
                TABLE_HEADER_ACTION_CLASS,
              ].join(" ")}
            >
              <Icon
                icon={action.icon ?? "mdi:plus"}
                className={TABLE_HEADER_ACTION_ICON_CLASS}
                aria-hidden="true"
              />
              {action.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
