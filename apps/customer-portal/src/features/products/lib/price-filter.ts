export const PRICE_FILTER_MIN = 5;
export const PRICE_FILTER_MAX = 100;

export function parsePriceParam(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.min(Math.max(parsed, PRICE_FILTER_MIN), PRICE_FILTER_MAX);
}

/**
 * Only sends a bound the shopper actually moved.
 *
 * The slider's ends are not real limits, they are the widget's range — forwarding them
 * untouched would hide every product under $5 or over $100 from someone who never touched
 * the filter. That was harmless against mock data priced inside the range and is not against
 * a real catalogue, least of all one priced in KHR.
 *
 * One behaviour difference from the old in-memory filter: core-api compares the product's
 * base price, while this used to compare the discounted price.
 */
export function toPriceFilter(minPrice: number, maxPrice: number): { minPrice?: number; maxPrice?: number } {
    return {
        ...(minPrice !== PRICE_FILTER_MIN && { minPrice }),
        ...(maxPrice !== PRICE_FILTER_MAX && { maxPrice })
    };
}

/**
 * Whether the shopper narrowed the range. Empty results mean different things either way —
 * with a filter on, the grid is empty because of a choice they can undo.
 */
export function isPriceFiltered(minPrice: number, maxPrice: number): boolean {
    return minPrice !== PRICE_FILTER_MIN || maxPrice !== PRICE_FILTER_MAX;
}
