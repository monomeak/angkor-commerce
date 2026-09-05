/**
 * Dates are formatted from AppConfig's locale and timezone rather than the ambient ones, so
 * the server and the browser render the same string — the same reason formatPrice takes a
 * locale. Accepts both an instant ("2026-09-02T04:11:07Z") and a plain date ("2026-09-02").
 */
export function formatDate(value: string, locale: string, timezone: string): string {
    return new Date(value).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: timezone
    });
}

export function formatDateTime(value: string, locale: string, timezone: string): string {
    return new Date(value).toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone
    });
}
