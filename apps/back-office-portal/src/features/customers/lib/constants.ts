import type { CustomerSortField, SortOrder } from "../types/customer";

export const PAGE_SIZE_OPTIONS = [10, 30, 50] as const;

/** Matches core-api's CustomerQueryParams.DEFAULT_LIMIT. */
export const DEFAULT_PAGE_SIZE = 30;

/** core-api clamps limit to 1..100 and rejects anything outside its sort whitelist. */
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_SORT_BY: CustomerSortField = "id";
export const DEFAULT_ORDER: SortOrder = "asc";

/** The API's whitelist. `displayName` is absent — it is computed in Java, not a column. */
export const SORTABLE_FIELDS: CustomerSortField[] = [
    "id",
    "firstName",
    "lastName",
    "companyName",
    "email",
    "createdAt",
    "updatedAt"
];

export const SEARCH_DEBOUNCE_MS = 300;
