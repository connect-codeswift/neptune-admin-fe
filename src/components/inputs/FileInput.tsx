"use client";

import { Icon } from "@iconify/react";
import { useId, useRef } from "react";

export type FileInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileInput({
  id,
  label,
  helperText,
  error,
  value = null,
  onChange,
  accept,
  disabled = false,
  placeholder = "Choose a file…",
  className = "",
  containerClassName = "",
}: Readonly<FileInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

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
        <label htmlFor={inputId} className="text7 text-darkest">
          {label}
        </label>
      ) : null}
      <div
        className={`flex h-12 items-center gap-2 rounded-2.5 border bg-ehs-surface/55 px-3 backdrop-blur-1.25 ${
          error ? "border-ehs-red" : "border-ehs-border-ink/8"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`.trim()}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-lightest px-3 py-1.5 text5 font-semibold text-blue-deep transition-colors hover:bg-blue-light disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:paperclip" width={16} height={16} aria-hidden />
          Browse
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text4 disabled:cursor-not-allowed"
        >
          {value ? (
            <span className="text-darkest">
              {value.name}{" "}
              <span className="text-gray">({formatFileSize(value.size)})</span>
            </span>
          ) : (
            <span className="text-ehs-muted-text">{placeholder}</span>
          )}
        </button>
        {value ? (
          <button
            type="button"
            disabled={disabled}
            aria-label="Clear file"
            onClick={() => {
              onChange?.(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ehs-muted-text transition-colors hover:bg-ehs-light-bg/60 hover:text-ehs-darker disabled:cursor-not-allowed"
          >
            <Icon icon="mdi:close" width={16} height={16} />
          </button>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled}
          aria-describedby={describedBy}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onChange?.(file);
          }}
        />
      </div>
      {fieldMessage}
    </div>
  );
}
