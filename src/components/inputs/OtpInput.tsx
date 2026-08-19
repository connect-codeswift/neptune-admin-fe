"use client";

import {
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

export type OtpInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  containerClassName?: string;
  className?: string;
};

export function OtpInput({
  id,
  label,
  helperText,
  error,
  value = "",
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  containerClassName = "",
  className = "",
}: Readonly<OtpInputProps>) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  let describedBy: string | undefined;
  if (error) {
    describedBy = `${groupId}-error`;
  } else if (helperText) {
    describedBy = `${groupId}-helper`;
  }

  let fieldMessage = null;
  if (error) {
    fieldMessage = (
      <p id={`${groupId}-error`} className="text8 text-red" role="alert">
        {error}
      </p>
    );
  } else if (helperText) {
    fieldMessage = (
      <p id={`${groupId}-helper`} className="text8 text-gray">
        {helperText}
      </p>
    );
  }

  const emit = (nextDigits: string[]) => {
    onChange?.(nextDigits.join("").slice(0, length));
  };

  const focusAt = (index: number) => {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = [...digits];
      next[index] = "";
      emit(next);
      return;
    }

    const next = [...digits];
    const chars = raw.split("");
    chars.forEach((char, offset) => {
      const target = index + offset;
      if (target < length) next[target] = char;
    });
    emit(next);
    const nextFocus = Math.min(index + chars.length, length - 1);
    focusAt(nextFocus);
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      emit(next);
      focusAt(index - 1);
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, index) => pasted[index] ?? "");
    emit(next);
    focusAt(Math.min(pasted.length, length) - 1);
  };

  return (
    <fieldset
      className={`flex w-full flex-col gap-1.5 border-0 p-0 ${containerClassName}`.trim()}
      aria-describedby={describedBy}
      disabled={disabled}
    >
      {label ? (
        <legend className="mb-0.5 text7 text-darkest">
          {label}
        </legend>
      ) : null}
      <div
        className={`grid w-full gap-2 ${className}`.trim()}
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      >
        {digits.map((digit, index) => (
          <input
            key={`${groupId}-digit-${index + 1}`}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            id={index === 0 ? groupId : `${groupId}-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={digit}
            autoFocus={autoFocus && index === 0}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={Boolean(error) || undefined}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className={`aspect-square h-auto w-full min-w-0 rounded-2.5 border bg-ehs-surface/55 text-center text3 text-ehs-darker backdrop-blur-1.25 outline-none transition aria-invalid:border-ehs-red aria-invalid:focus:border-ehs-red aria-invalid:focus:ring-ehs-red/15 disabled:cursor-not-allowed disabled:opacity-60 ${
              error
                ? "border-ehs-red focus:border-ehs-red focus:ring-0.75 focus:ring-ehs-red/15"
                : "border-ehs-border-ink/8 hover:border-ehs-border-ink/18 hover:bg-ehs-surface/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15"
            }`}
          />
        ))}
      </div>
      {fieldMessage}
    </fieldset>
  );
}
