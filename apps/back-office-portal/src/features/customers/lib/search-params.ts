import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE, DEFAULT_SORT_BY, MAX_PAGE_SIZE, SORTABLE_FIELDS } from "./constants";
import type { CustomerListParams, CustomerSortField, CustomerStatus, SortOrder } from "../types/customer";

/**
 * URL search params are the source of truth for the list (AGENTS.md), so this module owns
 * both directions of the conversion and nothing else parses the query string. Same shape as
 * the catalogue's `products/lib/search-params.ts`.
 *
 * Everything is validated on the way in: a hand-edited or stale URL is untrusted input, and
 * ?sortBy=name or ?limit=9999 would otherwise reach core-api and come back a 400.
 */

const STATUSES: CustomerStatus[] = ["active", "inactive", "deleted"];

function parseSortBy(value: string | null): CustomerSortField {
    return SORTABLE_FIELDS.includes(value as CustomerSortField) ? (value as CustomerSortField) : DEFAULT_SORT_BY;
}

function parseOrder(value: string | null): SortOrder {
    return value === "desc" ? "desc" : DEFAULT_ORDER;
}

function parseStatus(value: string | null): CustomerStatus | undefined {
    return STATUSES.includes(value as CustomerStatus) ? (value as CustomerStatus) : undefined;
}

function parsePositiveInt(value: string | null): number | undefined {
    if (!value) return undefined;

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseLimit(value: string | null): number {
    return Math.min(parsePositiveInt(value) ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
}

/**
 * The URL carries a 1-based `page` because that is what a person reading or sharing a link
 * expects; the API takes a 0-based `skip`. The translation happens here, once.
 */
export function parseCustomerSearchParams(params: URLSearchParams): CustomerListParams {
    const limit = parseLimit(params.get("limit"));
    const page = parsePositiveInt(params.get("page")) ?? 1;

    return {
        search: params.get("search")?.trim() || undefined,
        status: parseStatus(params.get("status")),
        sortBy: parseSortBy(params.get("sortBy")),
        order: parseOrder(params.get("order")),
        skip: (page - 1) * limit,
        limit
    };
}

export function getCurrentPage(params: CustomerListParams): number {
    return Math.floor(params.skip / params.limit) + 1;
}

export type CustomerFilterPatch = {
    search?: string | null;
    status?: CustomerStatus | null;
    sortBy?: CustomerSortField;
    order?: SortOrder;
    limit?: number;
    page?: number;
};

/**
 * Applies a change on top of the current URL. Defaults are written as absent keys rather
 * than explicit values, so the common case stays a clean, shareable URL.
 *
 * Any change other than paging resets to page 1 — otherwise narrowing a filter while on
 * page 5 lands the user on an empty page they did not ask for.
 */
export function buildCustomerSearchParams(current: URLSearchParams, patch: CustomerFilterPatch): URLSearchParams {
    const next = new URLSearchParams(current.toString());

    const setOrDelete = (key: string, value: string | null | undefined) => {
        if (value === null || value === undefined || value === "") {
            next.delete(key);
        } else {
            next.set(key, value);
        }
    };

    if ("search" in patch) setOrDelete("search", patch.search?.trim() || null);
    if ("status" in patch) setOrDelete("status", patch.status ?? null);
    if ("sortBy" in patch) setOrDelete("sortBy", patch.sortBy === DEFAULT_SORT_BY ? null : patch.sortBy);
    if ("order" in patch) setOrDelete("order", patch.order === DEFAULT_ORDER ? null : patch.order);
    if ("limit" in patch) setOrDelete("limit", patch.limit === DEFAULT_PAGE_SIZE ? null : String(patch.limit));

    const isPagingOnly = Object.keys(patch).length === 1 && "page" in patch;
    const page = isPagingOnly ? patch.page : 1;

    setOrDelete("page", page && page > 1 ? String(page) : null);

    return next;
}
