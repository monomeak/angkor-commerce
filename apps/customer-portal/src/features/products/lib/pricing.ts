/** Price after the product's discount, rounded to cents. */
export function applyDiscount(price: number, discountPercentage: number): number {
    if (!discountPercentage) {
        return price;
    }

    return Math.round((price - (price * discountPercentage) / 100) * 100) / 100;
}

/**
 * Products carry their own currency (core-api defaults to USD, but AppConfig's shop currency
 * is KHR), so prices are formatted from the product's code rather than a hardcoded "$".
 * Locale is passed in from AppConfig so the server and the browser format identically —
 * letting Intl fall back to the ambient locale would differ between them and break hydration.
 */
export function formatPrice(amount: number, currency: string, locale: string): string {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
