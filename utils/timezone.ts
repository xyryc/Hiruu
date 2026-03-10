import { DateTime } from "luxon";
import { getDeviceTimezone } from "./date";

/**
 * Get user's preferred timezone from preferences store
 * Falls back to device timezone if not available
 *
 * NOTE: This function should be called within React components/hooks
 * For non-React contexts, pass timezone explicitly to conversion functions
 */
export const getUserTimezone = (): string => {
    // Import here to avoid circular dependencies
    try {
        const { usePreferencesStore } = require("@/stores/preferencesStore");
        const timezone = usePreferencesStore.getState().timezone;
        return timezone || getDeviceTimezone();
    } catch {
        return getDeviceTimezone();
    }
};

/**
 * Convert local time string (HH:mm) to UTC time string (HH:mm)
 * Example: "01:00" local (Asia/Dhaka) → "19:00" UTC
 *
 * @param localTime - Time in HH:mm format (e.g., "01:00")
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns UTC time in HH:mm format
 */
export const localTimeToUTC = (
    localTime: string,
    timezone?: string
): string => {
    const tz = timezone || getUserTimezone();

    // Parse the time string
    const [hours, minutes] = localTime.split(":").map(Number);

    // Create a DateTime in the user's timezone for today
    const localDateTime = DateTime.now()
        .setZone(tz)
        .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

    // Convert to UTC and format as HH:mm
    return localDateTime.toUTC().toFormat("HH:mm");
};

/**
 * Convert UTC time string (HH:mm) to local time string (HH:mm)
 * Example: "19:00" UTC → "01:00" local (Asia/Dhaka)
 *
 * @param utcTime - Time in HH:mm format (e.g., "19:00")
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns Local time in HH:mm format
 */
export const utcTimeToLocal = (
    utcTime: string,
    timezone?: string
): string => {
    const tz = timezone || getUserTimezone();

    // Parse the time string
    const [hours, minutes] = utcTime.split(":").map(Number);

    // Create a DateTime in UTC for today
    const utcDateTime = DateTime.utc().set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0,
    });

    // Convert to user's timezone and format as HH:mm
    return utcDateTime.setZone(tz).toFormat("HH:mm");
};

/**
 * Convert UTC ISO string to local time for display
 * Example: "2026-03-09T01:00:00.000Z" → "07:00 AM" (Asia/Dhaka)
 *
 * @param utcISOString - ISO string in UTC
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns Formatted local time (e.g., "07:00 AM")
 */
export const formatUTCToLocalTime = (
    utcISOString: string,
    timezone?: string
): string => {
    const tz = timezone || getUserTimezone();
    const dateTime = DateTime.fromISO(utcISOString, { zone: "utc" });

    if (!dateTime.isValid) return "-";

    return dateTime.setZone(tz).toFormat("hh:mm a");
};

/**
 * Convert UTC ISO string to local date-time for display
 * Example: "2026-03-09T01:00:00.000Z" → "Mar 9, 2026 07:00 AM"
 *
 * @param utcISOString - ISO string in UTC
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns Formatted local date-time
 */
export const formatUTCToLocalDateTime = (
    utcISOString: string,
    timezone?: string
): string => {
    const tz = timezone || getUserTimezone();
    const dateTime = DateTime.fromISO(utcISOString, { zone: "utc" });

    if (!dateTime.isValid) return "-";

    return dateTime.setZone(tz).toFormat("MMM d, yyyy hh:mm a");
};

/**
 * Convert UTC ISO string to local date for display
 * Example: "2026-03-09T01:00:00.000Z" → "Mar 9, 2026"
 *
 * @param utcISOString - ISO string in UTC
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns Formatted local date
 */
export const formatUTCToLocalDate = (
    utcISOString: string,
    timezone?: string
): string => {
    const tz = timezone || getUserTimezone();
    const dateTime = DateTime.fromISO(utcISOString, { zone: "utc" });

    if (!dateTime.isValid) return "-";

    return dateTime.setZone(tz).toFormat("MMM d, yyyy");
};

/**
 * Format time range from UTC ISO strings
 * Example: "07:00 AM - 01:00 PM"
 *
 * @param startUTC - Start time ISO string in UTC
 * @param endUTC - End time ISO string in UTC
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns Formatted time range
 */
export const formatUTCTimeRange = (
    startUTC: string,
    endUTC: string,
    timezone?: string
): string => {
    const start = formatUTCToLocalTime(startUTC, timezone);
    const end = formatUTCToLocalTime(endUTC, timezone);

    if (start === "-" || end === "-") return "-";

    return `${start} - ${end}`;
};

/**
 * Convert local Date object to UTC time string (HH:mm)
 * Used when user selects time from a time picker
 *
 * @param localDate - Date object in local time
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns UTC time in HH:mm format
 */
export const localDateToUTCTime = (
    localDate: Date,
    timezone?: string
): string => {
    const tz = timezone || getUserTimezone();
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();

    const zonedDateTime = DateTime.now()
        .setZone(tz)
        .set({
            hour: hours,
            minute: minutes,
            second: 0,
            millisecond: 0,
        });

    return zonedDateTime.toUTC().toFormat("HH:mm");
};

/**
 * Convert UTC time string to local Date object
 * Used when displaying time in a time picker
 *
 * @param utcTime - Time in HH:mm format
 * @param timezone - User's timezone (defaults to device timezone)
 * @returns Date object in local time
 */
export const utcTimeToLocalDate = (
    utcTime: string,
    timezone?: string
): Date => {
    const localTime = utcTimeToLocal(utcTime, timezone);
    const [hours, minutes] = localTime.split(":").map(Number);
    const value = new Date();

    value.setHours(hours, minutes, 0, 0);
    return value;
};
