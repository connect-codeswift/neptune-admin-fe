"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import {
  addMonths,
  formatDisplayDate,
  formatMonthLabel,
  getMonthGrid,
  getWeekdayLabels,
  isSameDay,
  parseDayKey,
} from "@/utils/calendar.util";

export type DateInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  containerClassName?: string;
};

export function DateInput({
  id,
  label,
  helperText,
  error,
  value = "",
  onChange,
  placeholder = "Select date…",
  disabled = false,
  min,
  max,
  className = "",
  containerClassName = "",
}: Readonly<DateInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-panel`;
  const selected = parseDayKey(value);
  const minDate = parseDayKey(min);
  const maxDate = parseDayKey(max);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfSelectedOrToday(selected),
  );
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
      <p id={`${inputId}-error`} className="text6 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${inputId}-helper`} className="text6 text-gray">
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
    if (!open) {
      setViewMonth(startOfSelectedOrToday(selected));
    }
    setOpen((current) => !current);
  };

  const isDisabledDay = (day: Date) => {
    if (minDate && day < stripTime(minDate)) return true;
    if (maxDate && day > stripTime(maxDate)) return true;
    return false;
  };

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${containerClassName}`.trim()}
    >
      {label ? (
        <label htmlFor={inputId} className="text5 font-semibold text-darkest">
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
        className={`flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border bg-white px-3.5 text-left text5 shadow-lg outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-lightgray disabled:opacity-60 ${
          error
            ? "border-red focus:border-red focus-visible:ring-red/30"
            : "border-darkest/12 focus:border-blue-normal focus-visible:ring-blue-normal/30"
        } ${className}`.trim()}
      >
        <span className={selected ? "text-darkest" : "text-darkest/50"}>
          {selected ? formatDisplayDate(selected) : placeholder}
        </span>
        <Icon
          icon="mdi:calendar-month-outline"
          width={20}
          height={20}
          className="shrink-0 text-gray"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-[calc(100%+0.25rem)] left-0 z-20 w-74 rounded-[10px] border border-darkest/12 bg-white p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewMonth((current) => addMonths(current, -1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray transition-colors hover:bg-lightgray hover:text-darkest"
            >
              <Icon icon="mdi:chevron-left" width={20} height={20} />
            </button>
            <p className="text5 font-semibold text-darkest">
              {formatMonthLabel(viewMonth)}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewMonth((current) => addMonths(current, 1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-gray transition-colors hover:bg-lightgray hover:text-darkest"
            >
              <Icon icon="mdi:chevron-right" width={20} height={20} />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1">
            {getWeekdayLabels().map((day) => (
              <span
                key={day}
                className="py-1 text-center text7 text-gray"
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getMonthGrid(viewMonth).map((cell) => {
              if (cell.type === "empty") {
                return <span key={cell.id} className="size-9" />;
              }
              const day = cell.date;
              const key = cell.id;
              const isSelected = selected ? isSameDay(day, selected) : false;
              const dayDisabled = isDisabledDay(day);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={dayDisabled}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange?.(key);
                    setOpen(false);
                  }}
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    isSelected
                      ? "bg-blue-normal font-semibold text-white"
                      : "text-darkest hover:bg-blue-lightest"
                  }`}
                >
                  {day.getDate()}
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

function startOfSelectedOrToday(selected: Date | null) {
  if (selected) return new Date(selected.getFullYear(), selected.getMonth(), 1);
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
