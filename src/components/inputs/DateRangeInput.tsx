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
        <span className={start ? "text-ehs-darker" : "text-ehs-muted-text"}>
          {displayLabel}
        </span>
        <Icon
          icon="mdi:calendar-range"
          width={20}
          height={20}
          className="shrink-0 text-ehs-muted-text"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="animate-popover-in absolute top-[calc(100%+0.25rem)] left-0 z-20 w-74 rounded-xl border border-ehs-hairline/70 bg-ehs-surface/96 p-3 shadow-(--ehs-shadow-popover) backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewMonth((current) => addMonths(current, -1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ehs-muted-text transition-colors hover:bg-ehs-light-bg/60 hover:text-ehs-darker"
            >
              <Icon icon="mdi:chevron-left" width={20} height={20} />
            </button>
            <p className="text5 text-darkest">
              {formatMonthLabel(viewMonth)}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewMonth((current) => addMonths(current, 1))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ehs-muted-text transition-colors hover:bg-ehs-light-bg/60 hover:text-ehs-darker"
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
                "text-ehs-darker hover:bg-ehs-light-blue";
              if (isStart || isEnd) {
                dayClass = "bg-ehs-normal-blue font-semibold text-ehs-on-accent";
              } else if (inRange) {
                dayClass = "bg-ehs-light-blue text-ehs-darker";
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={dayDisabled}
                  aria-pressed={isStart || isEnd}
                  onClick={() => handleDayClick(day)}
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text4 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${dayClass}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text8 text-gray">
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
