"use client";

import { useId } from "react";
import type { SelectOption } from "./SelectInput";

export type CheckboxGroupInputProps = {
  id?: string;
  name?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
  containerClassName?: string;
};

export function CheckboxGroupInput({
  id,
  name,
  label,
  helperText,
  error,
  options,
  value = [],
  onChange,
  disabled = false,
  orientation = "vertical",
  className = "",
  containerClassName = "",
}: Readonly<CheckboxGroupInputProps>) {
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

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange?.(value.filter((item) => item !== optionValue));
      return;
    }
    onChange?.([...value, optionValue]);
  };

  return (
    <fieldset
      className={`flex flex-col gap-1.5 border-0 p-0 ${containerClassName}`.trim()}
      aria-describedby={describedBy}
      disabled={disabled}
    >
      {label ? (
        <legend className="mb-0.5 text7 text-darkest">
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
          const isChecked = value.includes(option.value);
          const isDisabled = disabled || Boolean(option.disabled);

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`inline-flex items-start gap-2.5 ${
                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {/* The tick is a background image, so its colour cannot follow a
                  token: the light theme strokes it white on the teal fill, the
                  dark theme strokes it in the on-accent ink because that fill
                  is much lighter there. */}
              <input
                id={optionId}
                type="checkbox"
                name={groupName}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => toggleValue(option.value)}
                className={`mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded border border-ehs-border-ink/25 bg-ehs-surface outline-none transition-colors checked:border-ehs-normal-blue checked:bg-ehs-normal-blue checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg>')] dark:checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="%23062430" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg>')] checked:bg-center checked:bg-no-repeat focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed ${
                  error ? "border-ehs-red" : ""
                }`}
              />
              <span className="text4 text-darkest">
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
