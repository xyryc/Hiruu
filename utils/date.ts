import { getCalendars } from "expo-localization";
import { DateTime } from "luxon";

export const formatDate = (
    value?: string | Date | null,
    fallback = "-"
): string => {
    if (!value) return fallback;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
};

export const formatDateRange = (
    start?: string | Date | null,
    end?: string | Date | null,
    fallback = "-"
): string => {
    const from = formatDate(start, "");
    const to = formatDate(end, "");
    if (!from && !to) return fallback;
    if (!from) return to;
    if (!to) return from;
    return `${from} - ${to}`;
};

export const formatCountdownFromSeconds = (totalSeconds: number): string => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
    )}:${String(seconds).padStart(2, "0")}`;
};

export const getCountdownLabel = (
    targetTimestamp?: number | null,
    nowTimestamp = Date.now()
): string | undefined => {
    if (typeof targetTimestamp !== "number" || Number.isNaN(targetTimestamp)) {
        return undefined;
    }

    const secondsLeft = (targetTimestamp - nowTimestamp) / 1000;
    return formatCountdownFromSeconds(secondsLeft);
};

export const getDeviceTimezone = (): string => {
    return getCalendars()[0]?.timeZone || "UTC";
};

/**
 * Get user's preferred timezone from preferences store
 * Falls back to device timezone if not available
 */
export const getUserTimezone = (): string => {
    try {
        const { usePreferencesStore } = require("@/stores/preferencesStore");
        const timezone = usePreferencesStore.getState().timezone;
        return timezone || getDeviceTimezone();
    } catch {
        return getDeviceTimezone();
    }
};

export const formatInTimezone = (
    value?: string | Date | null,
    timezone?: string,
    format = "dd LLL yyyy, hh:mm a",
    fallback = "-"
): string => {
    if (!value) return fallback;

    // Use user's preferred timezone if not specified
    const tz = timezone || getUserTimezone();

    const dateTime =
        typeof value === "string"
            ? DateTime.fromISO(value, { zone: "utc" })
            : DateTime.fromJSDate(value, { zone: "utc" });

    if (!dateTime.isValid) return fallback;

    return dateTime.setZone(tz).toFormat(format);
};

export const formatTimeInTimezone = (
    value?: string | Date | null,
    timezone?: string,
    fallback = "-"
): string => {
    return formatInTimezone(value, timezone, "hh:mm a", fallback);
};

export const formatShortDateInTimezone = (
    value?: string | Date | null,
    timezone?: string,
    fallback = "-"
): string => {
    return formatInTimezone(value, timezone, "LLL dd, yyyy", fallback);
};
