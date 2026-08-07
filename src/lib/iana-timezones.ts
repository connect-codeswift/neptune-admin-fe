import type { SelectOption } from "@/components/inputs";
import { IANA_TIMEZONE_IDS } from "@/lib/iana-timezones.data";

const COMMON_IANA_TIMEZONE_IDS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
] as const;

function formatTimezoneLabel(timeZoneId: string): string {
  return timeZoneId.replaceAll("_", " ");
}

function sortTimezones(timezones: readonly string[]): string[] {
  return [...timezones].sort((left, right) => left.localeCompare(right));
}

/** All supported IANA timezone ids shipped with the admin app. */
export function getIanaTimezoneIds(): readonly string[] {
  return IANA_TIMEZONE_IDS;
}

/** Dropdown options for site timezone selection. Preserves unknown saved values. */
export function getIanaTimezoneSelectOptions(
  selectedValue?: string | null,
): SelectOption[] {
  const known = new Set<string>(IANA_TIMEZONE_IDS);
  const ordered = [
    ...COMMON_IANA_TIMEZONE_IDS.filter((id) => known.has(id)),
    ...sortTimezones(
      IANA_TIMEZONE_IDS.filter(
        (id) => !(COMMON_IANA_TIMEZONE_IDS as readonly string[]).includes(id),
      ),
    ),
  ];

  const options: SelectOption[] = ordered.map((timeZoneId) => ({
    value: timeZoneId,
    label: formatTimezoneLabel(timeZoneId),
  }));

  const trimmed = selectedValue?.trim();
  if (trimmed && !known.has(trimmed)) {
    options.unshift({
      value: trimmed,
      label: `${formatTimezoneLabel(trimmed)} (saved)`,
    });
  }

  return options;
}

export { IANA_TIMEZONE_IDS, COMMON_IANA_TIMEZONE_IDS };
