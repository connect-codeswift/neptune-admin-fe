"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

export function SelectInput({
  id,
  label,
  helperText,
  error,
  options,
  value = "",
  onChange,
  placeholder = "Select…",
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<SelectInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

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

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${containerClassName}`.trim()}
    >
      {label ? (
        <label
          htmlFor={inputId}
          className="text5 font-semibold text-darkest"
        >
          {label}
        </label>
      ) : null}
      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border bg-white px-3.5 text-left text5 shadow-lg outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-lightgray disabled:opacity-60 ${
          error
            ? "border-red focus:border-red focus-visible:ring-red/30"
            : "border-darkest/12 focus:border-blue-normal focus-visible:ring-blue-normal/30"
        } ${className}`.trim()}
      >
        <span className={selected ? "text-darkest" : "text-darkest/50"}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          width={20}
          height={20}
          className="shrink-0 text-gray"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={listboxId}
          aria-labelledby={inputId}
          className="absolute top-[calc(100%+0.25rem)] left-0 z-20 max-h-60 w-full overflow-auto rounded-[10px] border border-darkest/12 bg-white p-1 shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text5 text-gray">No options</p>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={option.disabled}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "bg-blue-lightest text-blue-deep"
                      : "text-darkest hover:bg-lightgray"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <Icon
                      icon="mdi:check"
                      width={18}
                      height={18}
                      className="shrink-0 text-blue-normal"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
      {fieldMessage}
    </div>
  );
}
