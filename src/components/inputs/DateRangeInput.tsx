"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import {
  addMonths,
  formatDisplayDate,
  formatMonthLabel,
  getMonthGrid,
  getWeekdayLabels,
  isBeforeDay,
  isInRange,
  isSameDay,
  parseDayKey,
  toDayKey,
} from "@/utils/calendar.util";

export type DateRangeValue = {
  start: string;
  end: string;
};

export type DateRangeInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  containerClassName?: string;
};

export function DateRangeInput({
  id,
  label,
  helperText,
  error,
  value,
  onChange,
  placeholder = "Select date range…",
  disabled = false,
  min,
  max,
  className = "",
  containerClassName = "",
}: Readonly<DateRangeInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-panel`;
  const start = parseDayKey(value?.start);
  const end = parseDayKey(value?.end);
  const minDate = parseDayKey(min);
  const maxDate = parseDayKey(max);
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<Date | null>(start);
  const [viewMonth, setViewMonth] = useState(() => {
    if (start) return new Date(start.getFullYear(), start.getMonth(), 1);
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
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
    if (!open) {
      setDraftStart(start);
      if (start) {
        setViewMonth(new Date(start.getFullYear(), start.getMonth(), 1));
      }
    }
    setOpen((current) => !current);
  };

  const displayLabel = (() => {
    if (start && end) {
      return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
    }
    if (start) return `${formatDisplayDate(start)} – …`;
    return placeholder;
  })();

  const isDisabledDay = (day: Date) => {
    const stripped = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    if (minDate) {
      const minStripped = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate(),
      );
      if (stripped < minStripped) return true;
    }
    if (maxDate) {
      const maxStripped = new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        maxDate.getDate(),
      );
      if (stripped > maxStripped) return true;
    }
    return false;
  };

  const handleDayClick = (day: Date) => {
    if (!draftStart || (draftStart && end)) {
      setDraftStart(day);
      onChange?.({ start: toDayKey(day), end: "" });
      return;
    }

    if (isBeforeDay(day, draftStart)) {
      setDraftStart(day);
      onChange?.({ start: toDayKey(day), end: "" });
      return;
    }

    onChange?.({ start: toDayKey(draftStart), end: toDayKey(day) });
    setDraftStart(null);
    setOpen(false);
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
        <span className={start ? "text-darkest" : "text-darkest/50"}>
          {displayLabel}
        </span>
        <Icon
          icon="mdi:calendar-range"
          width={20}
          height={20}
          className="shrink-0 text-gray"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-[calc(100%+0.25rem)] left-0 z-20 w-74 rounded-[10px] border border-darkest/12 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
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
            <p className="text-sm font-semibold text-darkest">
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
                className="py-1 text-center text-[11px] font-medium text-gray"
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
              const rangeStart = draftStart ?? start;
              const rangeEnd = end;
              const isStart = rangeStart ? isSameDay(day, rangeStart) : false;
              const isEnd = rangeEnd ? isSameDay(day, rangeEnd) : false;
              const inRange =
                rangeStart && rangeEnd
                  ? isInRange(day, rangeStart, rangeEnd)
                  : false;
              const dayDisabled = isDisabledDay(day);

              let dayClass =
                "text-darkest hover:bg-blue-lightest";
              if (isStart || isEnd) {
                dayClass = "bg-blue-normal font-semibold text-white";
              } else if (inRange) {
                dayClass = "bg-blue-lightest text-blue-deep";
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={dayDisabled}
                  aria-pressed={isStart || isEnd}
                  onClick={() => handleDayClick(day)}
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${dayClass}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray">
            {draftStart && !end
              ? "Select an end date"
              : "Select a start date, then an end date"}
          </p>
        </div>
      ) : null}
      {fieldMessage}
    </div>
  );
}
