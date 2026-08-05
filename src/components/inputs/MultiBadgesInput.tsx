"use client";

import { Icon } from "@iconify/react";
import {
  useId,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

export type MultiBadgesInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

function normalizeBadge(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function MultiBadgesInput({
  id,
  label,
  helperText,
  error,
  value = [],
  onChange,
  placeholder = "Type and press Enter…",
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<MultiBadgesInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [draft, setDraft] = useState("");

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

  const addBadge = (raw: string) => {
    const next = normalizeBadge(raw);
    if (!next) return;
    if (value.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange?.([...value, next]);
    setDraft("");
  };

  const removeBadge = (badge: string) => {
    onChange?.(value.filter((item) => item !== badge));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (next.includes(",")) {
      const parts = next.split(",");
      const remainder = parts.pop() ?? "";
      parts.forEach((part) => addBadge(part));
      setDraft(remainder);
      return;
    }
    setDraft(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Tab") {
      if (!draft.trim()) return;
      event.preventDefault();
      addBadge(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && value.length > 0) {
      const lastBadge = value.at(-1);
      if (lastBadge) removeBadge(lastBadge);
    }
  };

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
      <div
        className={`flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded-[10px] border bg-white px-3 py-2 shadow-lg transition-colors focus-within:ring-2 ${
          error
            ? "border-red focus-within:border-red focus-within:ring-red/30"
            : "border-darkest/12 focus-within:border-blue-normal focus-within:ring-blue-normal/30"
        } ${disabled ? "cursor-not-allowed bg-lightgray opacity-60" : ""} ${className}`.trim()}
      >
        {value.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1 rounded-md bg-blue-lightest px-2 py-1 text6 text-blue-deep"
          >
            {badge}
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${badge}`}
              onClick={() => removeBadge(badge)}
              className="flex size-4 cursor-pointer items-center justify-center rounded text-blue-deep/70 transition-colors hover:text-blue-deep disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:close" width={14} height={14} aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => addBadge(draft)}
          className="min-w-32 flex-1 bg-transparent py-1 text5 text-darkest outline-none placeholder:text-darkest/50 disabled:cursor-not-allowed"
        />
      </div>
      {fieldMessage}
    </div>
  );
}
