export const DAYS_OF_WEEK_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export function getDayOfWeekShort(date: Date): string {
  return DAYS_OF_WEEK_SHORT[date.getDay()];
}

export function getUTCDayOfWeekShort(date: Date): string {
  return DAYS_OF_WEEK_SHORT[date.getUTCDay()];
}
