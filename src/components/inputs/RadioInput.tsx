"use client";

import { useId } from "react";
import type { SelectOption } from "./SelectInput";

export type RadioInputProps = {
  id?: string;
  name?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
  containerClassName?: string;
};

export function RadioInput({
  id,
  name,
  label,
  helperText,
  error,
  options,
  value = "",
  onChange,
  disabled = false,
  orientation = "vertical",
  className = "",
  containerClassName = "",
}: Readonly<RadioInputProps>) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const groupName = name ?? groupId;

  let describedBy: string | undefined;
  if (error) {
    describedBy = `${groupId}-error`;
  } else if (helperText) {
    describedBy = `${groupId}-helper`;
  }

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${groupId}-error`} className="text6 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${groupId}-helper`} className="text6 text-gray">
        {helperText}
      </p>
    );
  }

  return (
    <fieldset
      className={`flex flex-col gap-1.5 border-0 p-0 ${containerClassName}`.trim()}
      aria-describedby={describedBy}
      aria-invalid={Boolean(error) || undefined}
      disabled={disabled}
    >
      {label ? (
        <legend className="mb-0.5 text5 font-semibold text-darkest">
          {label}
        </legend>
      ) : null}
      <div
        className={`${
          orientation === "horizontal"
            ? "flex flex-wrap items-center gap-x-5 gap-y-2"
            : "flex flex-col gap-2.5"
        } ${className}`.trim()}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`inline-flex items-center gap-2.5 ${
                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                id={optionId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => onChange?.(option.value)}
                className={`size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-darkest/20 bg-white outline-none transition-colors checked:border-blue-normal checked:bg-[radial-gradient(circle_at_center,#0891a6_0_38%,transparent_40%)] focus-visible:ring-2 focus-visible:ring-blue-normal/30 disabled:cursor-not-allowed ${
                  error ? "border-red" : ""
                }`}
              />
              <span className="text5 text-darkest">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {fieldMessage}
    </fieldset>
  );
}
