"use client";

import { Icon } from "@iconify/react";
import { useId, type InputHTMLAttributes } from "react";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
};

export function SearchInput({
  id,
  label,
  helperText,
  error,
  className = "",
  containerClassName = "",
  disabled,
  placeholder = "Search…",
  ...props
}: Readonly<SearchInputProps>) {
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
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-darkest"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <Icon
          icon="mdi:magnify"
          width={20}
          height={20}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray"
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-[10px] border bg-white py-0 pr-3.5 pl-10 text-base text-darkest shadow-xl outline-none transition-colors placeholder:text-darkest/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-lightgray disabled:opacity-60 [&::-webkit-search-cancel-button]:appearance-none ${
            error
              ? "border-red focus:border-red focus-visible:ring-red/30"
              : "border-darkest/12 focus:border-blue-normal focus-visible:ring-blue-normal/30"
          } ${className}`.trim()}
          {...props}
        />
      </div>
      {fieldMessage}
    </div>
  );
}
