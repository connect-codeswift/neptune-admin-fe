/** SSR / fallback zone when the visitor's own timezone can't be resolved. */
export const DEMO_TIMEZONE = "UTC";

/**
 * The IANA timezone the booking UI operates in: the visitor's own zone, so slot
 * labels ("11:00 AM") mean the guest's local wall-clock time — not UTC. Falls
 * back to UTC during SSR or when the browser can't resolve a zone.
 *
 * This is the single lever that fixes the "picked 11 AM local, booked 11 AM UTC"
 * bug: every label→instant and instant→label conversion resolves through here.
 */
export function getBookingTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEMO_TIMEZONE;
  } catch {
    return DEMO_TIMEZONE;
  }
}

/** Short zone name at a given instant, e.g. "PDT", "GMT+5" (DST-aware). */
export function getTimeZoneAbbrev(
  date: Date = new Date(),
  timeZone: string = getBookingTimeZone(),
): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

/** UTC-offset label at a given instant, e.g. "GMT-7", "GMT+5". */
export function getTimeZoneOffsetLabel(
  date: Date = new Date(),
  timeZone: string = getBookingTimeZone(),
): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? "GMT";
  } catch {
    return "GMT";
  }
}

/** Human-facing zone label for the confirmation, e.g. "PDT (GMT-7)". */
export function getTimeZoneLabel(
  date: Date = new Date(),
  timeZone: string = getBookingTimeZone(),
): string {
  const abbrev = getTimeZoneAbbrev(date, timeZone);
  const offset = getTimeZoneOffsetLabel(date, timeZone);
  return abbrev === offset ? abbrev : `${abbrev} (${offset})`;
}

export function parse12hTime(
  timeStr: string,
): { hours: number; minutes: number } | null {
  const match = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(timeStr.trim());
  if (!match) return null;

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

/** "10:00 AM" / "3:00 PM" → "10:00" / "15:00" */
export const timeLabelTo24h = (timeStr: string): string => {
  const parsed = parse12hTime(timeStr);
  if (!parsed) return timeStr.trim();

  return `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`;
};

export const formatConfirmTime = (timeParam: string | null): string => {
  const fallback = "9:30 AM UTC";
  // The caller already formats the time in the visitor's zone and appends the
  // zone abbreviation (e.g. "11:00 AM PDT"), so pass it through as-is.
  return timeParam || fallback;
};

/** Offset of `timeZone` at `date`: local_as_UTC_ms - instant_ms. */
function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

/**
 * Wall-clock date+time in `timeZone` → absolute UTC Date.
 * Calendar y/m/d come from the picker (local calendar day the user selected).
 */
export function zonedWallTimeToUtc(
  year: number,
  monthIndex: number,
  day: number,
  hours: number,
  minutes: number,
  timeZone: string = DEMO_TIMEZONE,
): Date {
  const utcGuess = Date.UTC(year, monthIndex, day, hours, minutes, 0);
  let instant = utcGuess - getTimeZoneOffsetMs(timeZone, new Date(utcGuess));
  // Refine once around DST boundaries
  instant =
    Date.UTC(year, monthIndex, day, hours, minutes, 0) -
    getTimeZoneOffsetMs(timeZone, new Date(instant));
  return new Date(instant);
}

/** Format an ISO/UTC instant as 12h time in the visitor's zone (e.g. "2:00 PM"). */
export function formatDemoTime(
  dateTimeStr: string,
  timeZone: string = getBookingTimeZone(),
): string {
  const date = new Date(dateTimeStr);
  if (Number.isNaN(date.getTime())) return "9:30 AM";

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  // en-US may use a narrow no-break space before AM/PM
  return formatted.replaceAll("\u202f", " ");
}

/**
 * @deprecated Prefer formatDemoTime.
 */
export const getUTCTimeString = (dateTimeStr: string): string => {
  return formatDemoTime(dateTimeStr);
};
