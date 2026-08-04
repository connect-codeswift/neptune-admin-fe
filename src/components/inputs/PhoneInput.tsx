"use client";

import { Icon } from "@iconify/react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export type PhoneInputProps = {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: CountryCode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

type CountryOption = {
  code: CountryCode;
  dial: string;
  label: string;
};

function buildCountryOptions(): CountryOption[] {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  return getCountries()
    .map((code) => ({
      code,
      dial: `+${getCountryCallingCode(code)}`,
      label: displayNames.of(code) ?? code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const COUNTRY_OPTIONS = buildCountryOptions();

function resolveCountryOption(
  country: CountryCode,
  defaultCountry: CountryCode,
): CountryOption {
  return (
    COUNTRY_OPTIONS.find((item) => item.code === country) ??
    COUNTRY_OPTIONS.find((item) => item.code === defaultCountry) ??
    COUNTRY_OPTIONS[0]
  );
}

function filterCountries(query: string): CountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRY_OPTIONS;
  return COUNTRY_OPTIONS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.dial.includes(q) ||
      item.code.toLowerCase().includes(q),
  );
}

function getDescribedBy(
  inputId: string,
  error?: string,
  helperText?: string,
): string | undefined {
  if (error) return `${inputId}-error`;
  if (helperText) return `${inputId}-helper`;
  return undefined;
}

function FieldMessage({
  inputId,
  error,
  helperText,
}: Readonly<{
  inputId: string;
  error?: string;
  helperText?: string;
}>): ReactNode {
  if (error) {
    return (
      <p id={`${inputId}-error`} className="text-xs text-red" role="alert">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={`${inputId}-helper`} className="text-xs text-gray">
        {helperText}
      </p>
    );
  }
  return null;
}

function parseValueParts(
  value: string,
): { country?: CountryCode; national: string } | null {
  if (!value) return { national: "" };
  const next = parsePhoneNumberFromString(value);
  if (!next) return null;
  return {
    country: next.country,
    national: next.formatNational(),
  };
}

function formatPhoneInput(
  nextCountry: CountryCode,
  nextNational: string,
): { formatted: string; e164: string } {
  const formatter = new AsYouType(nextCountry);
  const formatted = formatter.input(nextNational);
  const parsedNumber = parsePhoneNumberFromString(formatted, nextCountry);
  if (parsedNumber) {
    return { formatted, e164: parsedNumber.format("E.164") };
  }
  const digits = formatted.replace(/\D/g, "");
  if (!digits) return { formatted, e164: "" };
  return {
    formatted,
    e164: `+${getCountryCallingCode(nextCountry)}${digits}`,
  };
}

function useDismissOnOutside(
  open: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  setOpen: (open: boolean) => void,
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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
  }, [open, rootRef, setOpen]);
}

function CountryPickerPanel({
  panelId,
  country,
  query,
  options,
  onQueryChange,
  onSelect,
}: Readonly<{
  panelId: string;
  country: CountryCode;
  query: string;
  options: CountryOption[];
  onQueryChange: (query: string) => void;
  onSelect: (code: CountryCode) => void;
}>) {
  return (
    <div
      id={panelId}
      className="absolute top-[calc(100%+0.25rem)] left-0 z-20 w-72 overflow-hidden rounded-[10px] border border-darkest/12 bg-white shadow-xl"
    >
      <div className="border-b border-darkest/10 p-2">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search country…"
          className="h-9 w-full rounded-lg border border-darkest/10 bg-lightgray px-3 text-sm text-darkest outline-none focus:border-blue-normal"
        />
      </div>
      <div className="max-h-56 overflow-auto p-1">
        {options.map((item) => (
          <button
            key={item.code}
            type="button"
            aria-pressed={item.code === country}
            onClick={() => onSelect(item.code)}
            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              item.code === country
                ? "bg-blue-lightest text-blue-deep"
                : "text-darkest hover:bg-lightgray"
            }`}
          >
            <span className="truncate">
              {item.label} ({item.code})
            </span>
            <span className="shrink-0 text-gray">{item.dial}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PhoneInput({
  id,
  label,
  helperText,
  error,
  value = "",
  onChange,
  defaultCountry = "US",
  placeholder = "Phone number",
  disabled = false,
  className = "",
  containerClassName = "",
}: Readonly<PhoneInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${inputId}-countries`;
  const initial = parseValueParts(value);
  const [country, setCountry] = useState<CountryCode>(
    initial?.country ?? defaultCountry,
  );
  const [national, setNational] = useState(initial?.national ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [syncedValue, setSyncedValue] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);

  if (value !== syncedValue) {
    setSyncedValue(value);
    const parts = parseValueParts(value);
    if (parts) {
      setNational(parts.national);
      if (parts.country) setCountry(parts.country);
    }
  }

  const selectedCountry = resolveCountryOption(country, defaultCountry);
  const filteredCountries = useMemo(() => filterCountries(query), [query]);
  const describedBy = getDescribedBy(inputId, error, helperText);

  useDismissOnOutside(open, rootRef, setOpen);

  const emitChange = (nextCountry: CountryCode, nextNational: string) => {
    const { formatted, e164 } = formatPhoneInput(nextCountry, nextNational);
    setNational(formatted);
    onChange?.(e164);
  };

  const fieldBorderClass = error
    ? "border-red focus-within:border-red focus-within:ring-red/30"
    : "border-darkest/12 focus-within:border-blue-normal focus-within:ring-blue-normal/30";

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 ${containerClassName}`.trim()}
    >
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-darkest">
          {label}
        </label>
      ) : null}
      <div
        className={`flex h-12 overflow-hidden rounded-[10px] border bg-white shadow-xl transition-colors focus-within:ring-2 ${fieldBorderClass} ${
          disabled ? "bg-lightgray opacity-60" : ""
        } ${className}`.trim()}
      >
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex shrink-0 cursor-pointer items-center gap-1 border-r border-darkest/10 px-3 text-sm font-medium text-darkest disabled:cursor-not-allowed"
        >
          <span>{selectedCountry.dial}</span>
          <Icon
            icon="mdi:chevron-down"
            width={16}
            height={16}
            className="text-gray"
          />
        </button>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={placeholder}
          value={national}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || undefined}
          onChange={(event) => emitChange(country, event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-base text-darkest outline-none placeholder:text-darkest/50 disabled:cursor-not-allowed"
        />
      </div>
      {open ? (
        <CountryPickerPanel
          panelId={panelId}
          country={country}
          query={query}
          options={filteredCountries}
          onQueryChange={setQuery}
          onSelect={(code) => {
            setCountry(code);
            setOpen(false);
            setQuery("");
            emitChange(code, national);
          }}
        />
      ) : null}
      <FieldMessage
        inputId={inputId}
        error={error}
        helperText={helperText}
      />
    </div>
  );
}
