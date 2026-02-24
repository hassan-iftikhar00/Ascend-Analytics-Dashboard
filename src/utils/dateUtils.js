import {
  subHours,
  subDays,
  format,
  eachDayOfInterval,
  eachHourOfInterval,
} from "date-fns";

/**
 * Get date range from preset string
 */
export function getDateRangeFromPreset(preset) {
  const now = new Date();
  switch (preset) {
    case "24h":
      return { from: subHours(now, 24), to: now };
    case "7d":
      return { from: subDays(now, 7), to: now };
    case "30d":
      return { from: subDays(now, 30), to: now };
    case "90d":
      return { from: subDays(now, 90), to: now };
    default:
      return { from: subHours(now, 24), to: now };
  }
}

/**
 * Format date for API params
 */
export function formatDateParam(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Format date for display
 */
export function formatDateDisplay(date) {
  return format(date, "MMM dd, yyyy");
}

/**
 * Format date + time for display
 */
export function formatDateTimeDisplay(date) {
  return format(date, "MMM dd, yyyy - HH:mm:ss");
}

/**
 * Get array of dates in range (for chart x-axis)
 */
export function getDaysInRange(from, to) {
  return eachDayOfInterval({ start: from, end: to }).map((d) =>
    format(d, "MMM dd"),
  );
}

/**
 * Get array of hours in range
 */
export function getHoursInRange(from, to) {
  return eachHourOfInterval({ start: from, end: to }).map((d) =>
    format(d, "HH:mm"),
  );
}
