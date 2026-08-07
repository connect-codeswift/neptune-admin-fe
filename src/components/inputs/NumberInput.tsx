"use client";

import { Icon } from "@iconify/react";
import {
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
} from "react";

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  showStepper?: boolean;
  onReset?: () => void;
  resetLabel?: string;
};

function clampValue(
  value: number,
  min?: number | string,
  max?: number | string,
): number {
  let next = value;
  if (min !== undefined && !Number.isNaN(Number(min))) {
    next = Math.max(next, Number(min));
  }
  if (max !== undefined && !Number.isNaN(Number(max))) {
    next = Math.min(next, Number(max));
  }
  return next;
}

export function NumberInput({
  id,
  label,
  helperText,
  error,
  className = "",
  containerClassName = "",
  disabled,
  inputMode = "numeric",
  step = 1,
  min,
  max,
  value,
  onChange,
  showStepper = false,
  onReset,
  resetLabel = "Reset to default",
  ...props
}: Readonly<NumberInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const stepAmount = Number(step) || 1;

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

  const emitValue = (next: number) => {
    if (!onChange) return;
    const clamped = clampValue(next, min, max);
    const syntheticEvent = {
      target: { value: String(clamped) },
      currentTarget: { value: String(clamped) },
    } as ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const adjustValue = (direction: -1 | 1) => {
    const current = Number(value) || 0;
    emitValue(current + direction * stepAmount);
  };

  const handleStepClick = (
    event: MouseEvent<HTMLButtonElement>,
    direction: -1 | 1,
  ) => {
    event.preventDefault();
    adjustValue(direction);
  };

  const handleResetClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onReset?.();
  };

  const hasControls = showStepper || Boolean(onReset);

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
      <div className={`relative ${hasControls ? "flex items-center" : ""}`}>
        <input
          id={inputId}
          type="number"
          inputMode={inputMode}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-[10px] border bg-white px-3.5 text5 text-darkest shadow-lg outline-none transition-colors placeholder:text-darkest/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-lightgray disabled:opacity-60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            hasControls ? "pr-28" : ""
          } ${
            error
              ? "border-red focus:border-red focus-visible:ring-red/30"
              : "border-darkest/12 focus:border-blue-normal focus-visible:ring-blue-normal/30"
          } ${className}`.trim()}
          {...props}
        />
        {hasControls ? (
          <div className="absolute inset-y-1 right-1 flex items-stretch gap-1">
            {onReset ? (
              <button
                type="button"
                disabled={disabled}
                aria-label={resetLabel}
                title={resetLabel}
                onClick={handleResetClick}
                className="flex w-9 items-center justify-center rounded-lg border border-darkest/10 text-gray transition-colors hover:bg-lightgray hover:text-darkest disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="lucide:rotate-ccw" width={14} height={14} aria-hidden />
              </button>
            ) : null}
            {showStepper ? (
              <div className="flex w-9 flex-col overflow-hidden rounded-lg border border-darkest/10">
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Increase by ${stepAmount}`}
                  onClick={(event) => handleStepClick(event, 1)}
                  className="flex flex-1 items-center justify-center text-darkest transition-colors hover:bg-lightgray disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon
                    icon="lucide:chevron-up"
                    width={14}
                    height={14}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Decrease by ${stepAmount}`}
                  onClick={(event) => handleStepClick(event, -1)}
                  className="flex flex-1 items-center justify-center border-t border-darkest/10 text-darkest transition-colors hover:bg-lightgray disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon
                    icon="lucide:chevron-down"
                    width={14}
                    height={14}
                    aria-hidden
                  />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {fieldMessage}
    </div>
  );
}
