export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getMonthShort(date: Date): string {
  return MONTHS_SHORT[date.getMonth()];
}

export function getUTCMonthShort(date: Date): string {
  return MONTHS_SHORT[date.getUTCMonth()];
}
