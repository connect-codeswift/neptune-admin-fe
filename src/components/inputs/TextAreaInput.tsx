"use client";

import { useId, type TextareaHTMLAttributes } from "react";

export type TextAreaInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
};

export function TextAreaInput({
  id,
  label,
  helperText,
  error,
  className = "",
  containerClassName = "",
  disabled,
  rows = 4,
  ...props
}: Readonly<TextAreaInputProps>) {
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

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`.trim()}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text7 text-darkest"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={`w-full resize-y rounded-2.5 border bg-ehs-surface/55 px-3.5 py-3 text4 text-ehs-darker backdrop-blur-1.25 outline-none transition placeholder:text-ehs-muted-text aria-invalid:border-ehs-red aria-invalid:focus:border-ehs-red aria-invalid:focus:ring-ehs-red/15 disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-ehs-red focus:border-ehs-red focus:ring-0.75 focus:ring-ehs-red/15"
            : "border-ehs-border-ink/8 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15"
        } ${className}`.trim()}
        {...props}
      />
      {fieldMessage}
    </div>
  );
}
