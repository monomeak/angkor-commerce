import type { InvoiceSortField, SortOrder } from "../types/invoice";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** Matches core-api's InvoiceQueryParams.DEFAULT_LIMIT. */
export const DEFAULT_PAGE_SIZE = 20;

/** core-api clamps limit to 1..100 and rejects anything outside its sort whitelist. */
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_SORT_BY: InvoiceSortField = "issueDate";
/** Newest first: an invoice list is read from the top, unlike the id-ascending catalogue. */
export const DEFAULT_ORDER: SortOrder = "desc";

export const SORTABLE_FIELDS: InvoiceSortField[] = [
    "id",
    "invoiceNumber",
    "issueDate",
    "dueDate",
    "total",
    "balance",
    "createdAt"
];

export const SEARCH_DEBOUNCE_MS = 300;
