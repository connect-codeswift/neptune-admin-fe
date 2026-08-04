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
      <p id={`${inputId}-error`} className="text6 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${inputId}-helper`} className="text6 text-gray">
        {helperText}
      </p>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`.trim()}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text5 font-semibold text-darkest"
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
          className={`h-12 w-full rounded-[10px] border bg-white py-0 pr-11 pl-3.5 text5 text-darkest shadow-xl outline-none transition-colors placeholder:text-darkest/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-lightgray disabled:opacity-60 ${
            error
              ? "border-red focus:border-red focus-visible:ring-red/30"
              : "border-darkest/12 focus:border-blue-normal focus-visible:ring-blue-normal/30"
          } ${className}`.trim()}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center text-gray transition-colors hover:text-darkest disabled:cursor-not-allowed disabled:opacity-60"
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
