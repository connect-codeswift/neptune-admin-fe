import { getDayOfWeekShort } from "@/utils/week.util";
import { getMonthShort } from "@/utils/month.util";
import { getYear } from "@/utils/year.util";
import { getBookingTimeZone } from "@/utils/time.util";

export const formatShortDate = (date: Date): string => {
  return `${getDayOfWeekShort(date)}, ${getMonthShort(date)} ${date.getDate()} ${getYear(date)}`;
};

export const formatConfirmDate = (
  dateParam: string | null,
  timeZone: string = getBookingTimeZone(),
): string => {
  const fallback = "Fri, July 10, 2026";
  if (!dateParam) return fallback;
  try {
    const parsedDate = new Date(dateParam);
    if (!Number.isNaN(parsedDate.getTime())) {
      // Confirmation date follows the visitor's zone so it matches the time.
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(parsedDate);
      return formatted;
    }
  } catch {
    // Keep fallback if parsing fails
  }
  return fallback;
};

/** Local calendar day as YYYY-MM-DD */
export const formatDayKey = (date: Date): string => {
  const y = getYear(date);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
