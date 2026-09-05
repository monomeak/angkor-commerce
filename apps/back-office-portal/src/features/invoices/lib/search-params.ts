import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE, DEFAULT_SORT_BY, MAX_PAGE_SIZE, SORTABLE_FIELDS } from "./constants";
import { FILTERABLE_STATUSES } from "./invoice-display";
import type { InvoiceListParams, InvoiceSortField, InvoiceStatus, SortOrder } from "../types/invoice";

/**
 * URL search params are the source of truth for the list (AGENTS.md), so this module owns both
 * directions of the conversion. Same shape as the catalogue's and the customer directory's.
 *
 * Everything is validated on the way in: a hand-edited or stale URL is untrusted input, and
 * ?sortBy=customerName or ?issueFrom=last-tuesday would otherwise reach core-api as a 400.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseSortBy(value: string | null): InvoiceSortField {
    return SORTABLE_FIELDS.includes(value as InvoiceSortField) ? (value as InvoiceSortField) : DEFAULT_SORT_BY;
}

function parseOrder(value: string | null): SortOrder {
    return value === "asc" ? "asc" : DEFAULT_ORDER;
}

function parseStatus(value: string | null): InvoiceStatus | undefined {
    const upper = value?.toUpperCase();
    return FILTERABLE_STATUSES.includes(upper as InvoiceStatus) ? (upper as InvoiceStatus) : undefined;
}

/** A calendar date only — the API binds these to LocalDate and rejects anything else. */
function parseDate(value: string | null): string | undefined {
    return value && ISO_DATE.test(value) ? value : undefined;
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
export function parseInvoiceSearchParams(params: URLSearchParams): InvoiceListParams {
    const limit = parseLimit(params.get("limit"));
    const page = parsePositiveInt(params.get("page")) ?? 1;

    return {
        search: params.get("search")?.trim() || undefined,
        status: parseStatus(params.get("status")),
        customerId: parsePositiveInt(params.get("customerId")),
        issueDateFrom: parseDate(params.get("issuedFrom")),
        issueDateTo: parseDate(params.get("issuedTo")),
        dueDateFrom: parseDate(params.get("dueFrom")),
        dueDateTo: parseDate(params.get("dueTo")),
        sortBy: parseSortBy(params.get("sortBy")),
        order: parseOrder(params.get("order")),
        skip: (page - 1) * limit,
        limit
    };
}

export function getCurrentPage(params: InvoiceListParams): number {
    return Math.floor(params.skip / params.limit) + 1;
}

export type InvoiceFilterPatch = {
    search?: string | null;
    status?: InvoiceStatus | null;
    customerId?: number | null;
    issueDateFrom?: string | null;
    issueDateTo?: string | null;
    dueDateFrom?: string | null;
    dueDateTo?: string | null;
    sortBy?: InvoiceSortField;
    order?: SortOrder;
    limit?: number;
    page?: number;
};

/**
 * Applies a change on top of the current URL. Defaults are written as absent keys rather than
 * explicit values, so the common case stays a clean, shareable URL.
 *
 * Any change other than paging resets to page 1 — otherwise narrowing a filter while on page 5
 * lands the user on an empty page they did not ask for.
 */
export function buildInvoiceSearchParams(current: URLSearchParams, patch: InvoiceFilterPatch): URLSearchParams {
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
    if ("customerId" in patch) setOrDelete("customerId", patch.customerId ? String(patch.customerId) : null);
    if ("issueDateFrom" in patch) setOrDelete("issuedFrom", patch.issueDateFrom ?? null);
    if ("issueDateTo" in patch) setOrDelete("issuedTo", patch.issueDateTo ?? null);
    if ("dueDateFrom" in patch) setOrDelete("dueFrom", patch.dueDateFrom ?? null);
    if ("dueDateTo" in patch) setOrDelete("dueTo", patch.dueDateTo ?? null);
    if ("sortBy" in patch) setOrDelete("sortBy", patch.sortBy === DEFAULT_SORT_BY ? null : patch.sortBy);
    if ("order" in patch) setOrDelete("order", patch.order === DEFAULT_ORDER ? null : patch.order);
    if ("limit" in patch) setOrDelete("limit", patch.limit === DEFAULT_PAGE_SIZE ? null : String(patch.limit));

    const isPagingOnly = Object.keys(patch).length === 1 && "page" in patch;
    const page = isPagingOnly ? patch.page : 1;

    setOrDelete("page", page && page > 1 ? String(page) : null);

    return next;
}
