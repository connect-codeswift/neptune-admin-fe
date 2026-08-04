"use client";

import { useId } from "react";

export type ToggleInputProps = {
  id?: string;
  label?: string;
  description?: string;
  helperText?: string;
  error?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

export function ToggleInput({
  id,
  label,
  description,
  helperText,
  error,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<ToggleInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

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

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`.trim()}>
      <div className={`flex items-start justify-between gap-3 ${className}`.trim()}>
        {label || description ? (
          <div className="min-w-0 flex-1">
            {label ? (
              <label
                htmlFor={inputId}
                className={`text-sm font-semibold text-darkest ${
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                {label}
              </label>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-gray">{description}</p>
            ) : null}
          </div>
        ) : null}
        <button
          id={inputId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-normal/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
            checked ? "bg-blue-normal" : "bg-darkest/20"
          }`}
        >
          <span
            aria-hidden
            className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {fieldMessage}
    </div>
  );
}

export { ToggleInput as SwitchInput };
export type { ToggleInputProps as SwitchInputProps };
