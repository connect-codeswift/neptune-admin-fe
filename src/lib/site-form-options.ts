import type { SelectOption } from "@/components/inputs";

export const SITE_INDUSTRY_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "oil-and-gas", label: "Oil & Gas" },
  { value: "construction", label: "Construction" },
  { value: "chemical", label: "Chemical" },
  { value: "other", label: "Other" },
];

export const SITE_SIZE_OPTIONS: readonly SelectOption[] = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200" },
  { value: "201-1000", label: "201-1,000" },
  { value: "1001+", label: "1,001+" },
];

function withSavedOption(
  options: readonly SelectOption[],
  selectedValue?: string | null,
): SelectOption[] {
  const trimmed = selectedValue?.trim();
  if (!trimmed) {
    return [...options];
  }

  if (options.some((option) => option.value === trimmed)) {
    return [...options];
  }

  return [{ value: trimmed, label: `${trimmed} (saved)` }, ...options];
}

export function getSiteIndustryTypeSelectOptions(
  selectedValue?: string | null,
): SelectOption[] {
  return withSavedOption(SITE_INDUSTRY_TYPE_OPTIONS, selectedValue);
}

export function getSiteSizeSelectOptions(
  selectedValue?: string | null,
): SelectOption[] {
  return withSavedOption(SITE_SIZE_OPTIONS, selectedValue);
}

export function siteIndustryTypeLabel(value: string): string {
  return (
    SITE_INDUSTRY_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function siteSizeLabel(value: string): string {
  return SITE_SIZE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
