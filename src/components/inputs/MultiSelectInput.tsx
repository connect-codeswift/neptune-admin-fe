"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";
import { useDropdownPlacement } from "@/hooks/useDropdownPlacement";
import type { SelectOption } from "./SelectInput";

export type MultiSelectInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

export function MultiSelectInput({
  id,
  label,
  helperText,
  error,
  options,
  value = [],
  onChange,
  placeholder = "Select…",
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<MultiSelectInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const { menuPositionClassName, maxHeight } = useDropdownPlacement(
    open,
    triggerRef,
    listboxRef,
    [options.length],
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

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

  const toggleValue = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange?.(value.filter((item) => item !== nextValue));
      return;
    }
    onChange?.([...value, nextValue]);
  };

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${open ? "z-50" : ""} ${containerClassName}`.trim()}
    >
      {label ? (
        <label
          htmlFor={inputId}
          className="text7 text-darkest"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-describedby={describedBy}
          onClick={() => setOpen((current) => !current)}
          className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-2.5 border bg-ehs-surface/55 px-3.5 py-2 text-left text4 backdrop-blur-1.25 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? "border-ehs-red focus:border-ehs-red focus:ring-0.75 focus:ring-ehs-red/15"
              : "border-ehs-border-ink/8 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15"
          } ${className}`.trim()}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length === 0 ? (
              <span className="text-ehs-muted-text">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center rounded-md bg-blue-lightest px-2 py-0.5 text7 text-blue-deep"
                >
                  {option.label}
                </span>
              ))
            )}
          </span>
          <Icon
            icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
            width={20}
            height={20}
            className="shrink-0 text-ehs-muted-text"
            aria-hidden
          />
        </button>
        {open ? (
          <div
            ref={listboxRef}
            id={listboxId}
            aria-labelledby={inputId}
            style={{ maxHeight }}
            className={`animate-popover-in absolute left-0 z-50 w-full overflow-auto rounded-xl border border-ehs-hairline/70 bg-ehs-surface/96 p-1 shadow-(--ehs-shadow-popover) backdrop-blur-xl scrollbar-none ${menuPositionClassName}`}
          >
            {options.length === 0 ? (
              <p className="px-3 py-2 text4 text-gray">No options</p>
            ) : (
              options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={option.disabled}
                    onClick={() => toggleValue(option.value)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text4 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "bg-ehs-light-bg/70 font-semibold text-ehs-darker"
                        : "text-ehs-darker hover:bg-ehs-light-bg/50"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Icon
                        icon="mdi:check"
                        width={18}
                        height={18}
                        className="shrink-0 text-ehs-normal-blue"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
      {fieldMessage}
    </div>
  );
}
