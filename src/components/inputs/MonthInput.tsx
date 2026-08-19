"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import { MONTH_OPTIONS } from "@/utils/calendar.util";

export type MonthInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  containerClassName?: string;
};

function parseMonthValue(value?: string): { year: number; month: string } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: match[2] };
}

function formatMonthDisplay(value: string): string {
  const parsed = parseMonthValue(value);
  if (!parsed) return value;
  const month = MONTH_OPTIONS.find((item) => item.value === parsed.month);
  return `${month?.label ?? parsed.month} ${parsed.year}`;
}

export function MonthInput({
  id,
  label,
  helperText,
  error,
  value = "",
  onChange,
  placeholder = "Select month…",
  disabled = false,
  minYear = 1970,
  maxYear = 2100,
  className = "",
  containerClassName = "",
}: Readonly<MonthInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-panel`;
  const parsed = parseMonthValue(value);
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(parsed?.year ?? now.getFullYear());
  const rootRef = useRef<HTMLDivElement>(null);

  let describedBy: string | undefined;
  if (error) {
    describedBy = `${inputId}-error`;
  } else if (helperText) {
    describedBy = `${inputId}-helper`;
  }

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${inputId}-error`} className="text8 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${inputId}-helper`} className="text8 text-gray">
        {helperText}
      </p>
    );
  }

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && parsed) {
      setYear(parsed.year);
    }
    setOpen((current) => !current);
  };

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${containerClassName}`.trim()}
    >
      {label ? (
        <label htmlFor={inputId} className="text7 text-darkest">
          {label}
        </label>
      ) : null}
      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={describedBy}
        onClick={handleToggle}
        className={`flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-2.5 border bg-ehs-surface/55 px-3.5 text-left text4 backdrop-blur-1.25 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-ehs-red focus:border-ehs-red focus:ring-0.75 focus:ring-ehs-red/15"
            : "border-ehs-border-ink/8 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15"
        } ${className}`.trim()}
      >
        <span className={parsed ? "text-ehs-darker" : "text-ehs-muted-text"}>
          {parsed ? formatMonthDisplay(value) : placeholder}
        </span>
        <Icon
          icon="mdi:calendar-month"
          width={20}
          height={20}
          className="shrink-0 text-ehs-muted-text"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="animate-popover-in absolute top-[calc(100%+0.25rem)] left-0 z-20 w-72 rounded-xl border border-ehs-hairline/70 bg-ehs-surface/96 p-3 shadow-(--ehs-shadow-popover) backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous year"
              disabled={year <= minYear}
              onClick={() => setYear((current) => Math.max(minYear, current - 1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ehs-muted-text transition-colors hover:bg-ehs-light-bg/60 hover:text-ehs-darker disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-left" width={20} height={20} />
            </button>
            <p className="text5 text-darkest">{year}</p>
            <button
              type="button"
              aria-label="Next year"
              disabled={year >= maxYear}
              onClick={() => setYear((current) => Math.min(maxYear, current + 1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ehs-muted-text transition-colors hover:bg-ehs-light-bg/60 hover:text-ehs-darker disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-right" width={20} height={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_OPTIONS.map((option) => {
              const optionValue = `${year}-${option.value}`;
              const isSelected = value === optionValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange?.(optionValue);
                    setOpen(false);
                  }}
                  className={`cursor-pointer rounded-lg px-2 py-2 text4 transition-colors ${
                    isSelected
                      ? "bg-ehs-normal-blue font-semibold text-ehs-on-accent"
                      : "text-ehs-darker hover:bg-ehs-light-blue"
                  }`}
                >
                  {option.label.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {fieldMessage}
    </div>
  );
}
