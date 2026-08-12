import type { ProductSortField, SortOrder } from "../types/product";

/** Single place to tune the "running low" signal on the list. */
export const LOW_STOCK_THRESHOLD = 10;

export const PAGE_SIZE_OPTIONS = [10, 30, 50] as const;

/** Matches core-api's ProductQueryParams.DEFAULT_LIMIT. */
export const DEFAULT_PAGE_SIZE = 30;

/** core-api clamps limit to 1..100 and rejects anything outside its sort whitelist. */
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_SORT_BY: ProductSortField = "id";
export const DEFAULT_ORDER: SortOrder = "asc";

/**
 * Only these are accepted by the API's whitelist. Note the absence of `stock`: a product's
 * stock is summed across variants at query time, not a column, so it cannot be sorted on.
 */
export const SORTABLE_FIELDS: ProductSortField[] = ["id", "name", "price", "rating", "createdAt", "updatedAt"];

export const SEARCH_DEBOUNCE_MS = 300;

/** core-api's CreateProductVariantRequest enforces this exact pattern. */
export const SKU_PATTERN = /^[A-Z0-9-]{3,100}$/;

/**
 * Mirrors `angkor.product.max_images` in application-dev.yml. The API is the real gate —
 * it counts rows before accepting an upload — so this only keeps the UI from offering an
 * action that is going to be rejected.
 */
export const MAX_PRODUCT_IMAGES = 5;

/** The currencies the shop actually trades in. core-api validates any `^[A-Z]{3}$`. */
export const SUPPORTED_CURRENCIES = ["USD", "KHR"] as const;

export const DISCOUNT_PRESETS = [10, 15, 20, 30, 50] as const;

/**
 * Seeded products already carry discounts outside the preset list (5% exists today), and a
 * fixed set of radios would quietly rewrite one of those to a preset the moment someone
 * edited an unrelated field. Keeping the current value as its own option means the control
 * can always represent what is actually stored.
 */
export function discountOptions(current: number | null | undefined): number[] {
    const presets: number[] = [...DISCOUNT_PRESETS];

    if (current === null || current === undefined || current === 0 || presets.includes(current)) {
        return presets;
    }

    return [...presets, current].sort((a, b) => a - b);
}

/**
 * Bounds for the price slider. The slider is a coarse control paired with an exact number
 * input — money needs decimals it cannot reliably hit, and a product priced above the
 * ceiling has to stay editable, so the form raises `max` to fit the current value.
 */
export const PRICE_SLIDER_MIN = 1;
export const PRICE_SLIDER_MAX = 100;
export const PRICE_SLIDER_STEP = 0.5;
