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
      <p id={`${inputId}-error`} className="text8 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${inputId}-helper`} className="pl-6.5 text8 text-gray">
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
        {/* The tick is a background image, so its colour cannot follow a
            token: the light theme strokes it white on the teal fill, the dark
            theme strokes it in the on-accent ink because that fill is much
            lighter there. */}
        <input
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded border border-ehs-border-ink/25 bg-ehs-surface outline-none transition-colors checked:border-ehs-normal-blue checked:bg-ehs-normal-blue checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg>')] dark:checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="%23062430" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg>')] checked:bg-center checked:bg-no-repeat focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed ${
            error ? "border-ehs-red" : ""
          } ${className}`.trim()}
          {...props}
        />
        {label ? (
          <span className="text4 text-darkest">{label}</span>
        ) : null}
      </label>
      {fieldMessage}
    </div>
  );
}
