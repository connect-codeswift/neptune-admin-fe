"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type YearInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: number | string;
  onChange?: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  containerClassName?: string;
};

export function YearInput({
  id,
  label,
  helperText,
  error,
  value,
  onChange,
  placeholder = "Select year…",
  disabled = false,
  minYear = 1970,
  maxYear = 2100,
  className = "",
  containerClassName = "",
}: Readonly<YearInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-panel`;
  const selectedYear =
    value === undefined || value === "" ? null : Number(value);
  const nowYear = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const [windowStart, setWindowStart] = useState(() => {
    const base = selectedYear ?? nowYear;
    return Math.floor(base / 12) * 12;
  });
  const rootRef = useRef<HTMLDivElement>(null);

  const years = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => windowStart + index).filter(
      (year) => year >= minYear && year <= maxYear,
    );
  }, [windowStart, minYear, maxYear]);

  let describedBy: string | undefined;
  if (error) {
    describedBy = `${inputId}-error`;
  } else if (helperText) {
    describedBy = `${inputId}-helper`;
  }

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${inputId}-error`} className="text-xs text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${inputId}-helper`} className="text-xs text-gray">
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
    if (!open && selectedYear != null && !Number.isNaN(selectedYear)) {
      setWindowStart(Math.floor(selectedYear / 12) * 12);
    }
    setOpen((current) => !current);
  };

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${containerClassName}`.trim()}
    >
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-darkest">
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
        className={`flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border bg-white px-3.5 text-left text-base shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-lightgray disabled:opacity-60 ${
          error
            ? "border-red focus:border-red focus-visible:ring-red/30"
            : "border-darkest/12 focus:border-blue-normal focus-visible:ring-blue-normal/30"
        } ${className}`.trim()}
      >
        <span
          className={
            selectedYear != null && !Number.isNaN(selectedYear)
              ? "text-darkest"
              : "text-darkest/50"
          }
        >
          {selectedYear != null && !Number.isNaN(selectedYear)
            ? selectedYear
            : placeholder}
        </span>
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          width={20}
          height={20}
          className="shrink-0 text-gray"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-[calc(100%+0.25rem)] left-0 z-20 w-72 rounded-[10px] border border-darkest/12 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous years"
              disabled={windowStart <= minYear}
              onClick={() =>
                setWindowStart((current) => Math.max(minYear, current - 12))
              }
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray transition-colors hover:bg-lightgray hover:text-darkest disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-left" width={20} height={20} />
            </button>
            <p className="text-sm font-semibold text-darkest">
              {years[0]} – {years.at(-1)}
            </p>
            <button
              type="button"
              aria-label="Next years"
              disabled={windowStart + 12 > maxYear}
              onClick={() =>
                setWindowStart((current) => Math.min(maxYear - 11, current + 12))
              }
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray transition-colors hover:bg-lightgray hover:text-darkest disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-right" width={20} height={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {years.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange?.(year);
                    setOpen(false);
                  }}
                  className={`cursor-pointer rounded-lg px-2 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-normal font-semibold text-white"
                      : "text-darkest hover:bg-blue-lightest"
                  }`}
                >
                  {year}
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
