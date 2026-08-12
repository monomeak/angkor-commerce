/**
 * One place for money and date presentation. These are display-only helpers: money never
 * gets arithmetic done on it in the UI (the API is the only thing that computes totals),
 * and dates are formatted, never re-parsed into another timezone for storage.
 */

const DISPLAY_LOCALE = "en-KH";
const DISPLAY_TIMEZONE = "Asia/Phnom_Penh";

/**
 * Currency comes from the record itself, not from AppConfig — core-api stores a currency
 * per product, and the seeded catalogue is USD even though the app default is KHR.
 * Formatting everything as KHR would silently misprice the whole table.
 */
export function formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat(DISPLAY_LOCALE, { style: "currency", currency }).format(value);
}

/** Percentages arrive as 0–100, not 0–1. */
export function formatPercent(value: number): string {
    return `${new Intl.NumberFormat(DISPLAY_LOCALE, { maximumFractionDigits: 2 }).format(value)}%`;
}

/** ISO 8601 in, Phnom Penh wall-clock out. Invalid input renders as an em dash, not "Invalid Date". */
export function formatDateTime(isoString: string | null | undefined): string {
    if (!isoString) return "—";

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: DISPLAY_TIMEZONE
    }).format(date);
}

export function formatDate(isoString: string | null | undefined): string {
    if (!isoString) return "—";

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
        dateStyle: "medium",
        timeZone: DISPLAY_TIMEZONE
    }).format(date);
}
