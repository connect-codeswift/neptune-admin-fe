"use client";

import { useId } from "react";
import { DateInput } from "./DateInput";
import { TimeInput } from "./TimeInput";

export type DateTimeInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  datePlaceholder?: string;
  timePlaceholder?: string;
  disabled?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  className?: string;
  containerClassName?: string;
};

function splitDateTime(value?: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const [date = "", timePart = ""] = value.split("T");
  const time = timePart.slice(0, 5);
  return { date, time };
}

function joinDateTime(date: string, time: string): string {
  if (!date) return "";
  if (!time) return date;
  return `${date}T${time}`;
}

export function DateTimeInput({
  id,
  label,
  helperText,
  error,
  value = "",
  onChange,
  datePlaceholder,
  timePlaceholder,
  disabled = false,
  minuteStep = 15,
  className = "",
  containerClassName = "",
}: Readonly<DateTimeInputProps>) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const { date, time } = splitDateTime(value);

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${groupId}-error`} className="text8 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${groupId}-helper`} className="text8 text-gray">
        {helperText}
      </p>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`.trim()}>
      {label ? (
        <p className="text7 text-darkest">{label}</p>
      ) : null}
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`.trim()}>
        <DateInput
          id={`${groupId}-date`}
          value={date}
          disabled={disabled}
          placeholder={datePlaceholder}
          onChange={(nextDate) => onChange?.(joinDateTime(nextDate, time))}
        />
        <TimeInput
          id={`${groupId}-time`}
          value={time}
          disabled={disabled}
          placeholder={timePlaceholder}
          minuteStep={minuteStep}
          onChange={(nextTime) => onChange?.(joinDateTime(date, nextTime))}
        />
      </div>
      {fieldMessage}
    </div>
  );
}
