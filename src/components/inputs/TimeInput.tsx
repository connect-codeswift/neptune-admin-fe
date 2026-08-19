"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import {
  formatDisplayTime,
  parseTimeValue,
  toTimeValue,
} from "@/utils/calendar.util";

export type TimeInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  className?: string;
  containerClassName?: string;
};

export function TimeInput({
  id,
  label,
  helperText,
  error,
  value = "",
  onChange,
  placeholder = "Select time…",
  disabled = false,
  minuteStep = 15,
  className = "",
  containerClassName = "",
}: Readonly<TimeInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-panel`;
  const parsed = parseTimeValue(value);
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(parsed?.hours ?? 9);
  const [minutes, setMinutes] = useState(parsed?.minutes ?? 0);
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
      setHours(parsed.hours);
      setMinutes(parsed.minutes);
    }
    setOpen((current) => !current);
  };

  const minuteOptions = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, index) => index * minuteStep,
  );
  const hourOptions = Array.from({ length: 24 }, (_, index) => index);

  const applyTime = (nextHours: number, nextMinutes: number) => {
    setHours(nextHours);
    setMinutes(nextMinutes);
    onChange?.(toTimeValue(nextHours, nextMinutes));
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
          {parsed ? formatDisplayTime(value) : placeholder}
        </span>
        <Icon
          icon="mdi:clock-outline"
          width={20}
          height={20}
          className="shrink-0 text-ehs-muted-text"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="animate-popover-in absolute top-[calc(100%+0.25rem)] left-0 z-20 w-56 rounded-xl border border-ehs-hairline/70 bg-ehs-surface/96 p-3 shadow-(--ehs-shadow-popover) backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text7 text-gray">Hour</p>
              <div className="max-h-40 space-y-1 overflow-auto">
                {hourOptions.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    aria-pressed={hours === hour}
                    onClick={() => applyTime(hour, minutes)}
                    className={`flex w-full cursor-pointer items-center justify-center rounded-lg px-2 py-1.5 text4 transition-colors ${
                      hours === hour
                        ? "bg-ehs-normal-blue font-semibold text-ehs-on-accent"
                        : "text-ehs-darker hover:bg-ehs-light-bg/50"
                    }`}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text7 text-gray">Minute</p>
              <div className="max-h-40 space-y-1 overflow-auto">
                {minuteOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    aria-pressed={minutes === minute}
                    onClick={() => applyTime(hours, minute)}
                    className={`flex w-full cursor-pointer items-center justify-center rounded-lg px-2 py-1.5 text4 transition-colors ${
                      minutes === minute
                        ? "bg-ehs-normal-blue font-semibold text-ehs-on-accent"
                        : "text-ehs-darker hover:bg-ehs-light-bg/50"
                    }`}
                  >
                    {String(minute).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full cursor-pointer rounded-lg bg-blue-lightest px-3 py-2 text5 font-semibold text-blue-deep transition-colors hover:bg-blue-light"
          >
            Done
          </button>
        </div>
      ) : null}
      {fieldMessage}
    </div>
  );
}
