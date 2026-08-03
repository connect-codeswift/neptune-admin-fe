"use client";

import { useId, type InputHTMLAttributes } from "react";

export type CheckBoxInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
};

export function CheckBoxInput({
  id,
  label,
  helperText,
  error,
  className = "",
  containerClassName = "",
  disabled,
  ...props
}: Readonly<CheckBoxInputProps>) {
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
      <p id={`${inputId}-helper`} className="pl-6.5 text-xs text-gray">
        {helperText}
      </p>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`.trim()}>
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-2.5 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <input
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded border border-darkest/20 bg-white outline-none transition-colors checked:border-blue-normal checked:bg-blue-normal checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg>')] checked:bg-center checked:bg-no-repeat focus-visible:ring-2 focus-visible:ring-blue-normal/30 disabled:cursor-not-allowed ${
            error ? "border-red" : ""
          } ${className}`.trim()}
          {...props}
        />
        {label ? (
          <span className="text-sm font-medium text-darkest">{label}</span>
        ) : null}
      </label>
      {fieldMessage}
    </div>
  );
}
