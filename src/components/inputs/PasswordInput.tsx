"use client";

import { Icon } from "@iconify/react";
import { useId, useState, type InputHTMLAttributes } from "react";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
};

export function PasswordInput({
  id,
  label,
  helperText,
  error,
  className = "",
  containerClassName = "",
  disabled,
  autoComplete = "current-password",
  ...props
}: Readonly<PasswordInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

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
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-2.5 border bg-ehs-surface/55 py-0 pr-11 pl-3.5 text4 text-ehs-darker backdrop-blur-1.25 outline-none transition placeholder:text-ehs-muted-text aria-invalid:border-ehs-red aria-invalid:focus:border-ehs-red aria-invalid:focus:ring-ehs-red/15 disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? "border-ehs-red focus:border-ehs-red focus:ring-0.75 focus:ring-ehs-red/15"
              : "border-ehs-border-ink/8 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15"
          } ${className}`.trim()}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-ehs-muted-text transition-colors hover:text-ehs-gray disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            icon={visible ? "mdi:eye-off-outline" : "mdi:eye-outline"}
            width={20}
            height={20}
          />
        </button>
      </div>
      {fieldMessage}
    </div>
  );
}
