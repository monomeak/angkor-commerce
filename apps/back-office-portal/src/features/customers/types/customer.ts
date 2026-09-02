/**
 * Domain types for the customer directory, mapped from core-api's CustomerResponse.
 *
 * The list and detail endpoints return the *same* shape here, unlike products — core-api has
 * one CustomerResponse and both `GET /customers` and `GET /customers/{id}` hand it back — so
 * one type covers both and a row opened in the dialog needs no second fetch to be complete.
 */
export type CustomerStatus = "active" | "inactive" | "deleted";

export type CustomerSortField = "id" | "firstName" | "lastName" | "companyName" | "email" | "createdAt" | "updatedAt";

export type SortOrder = "asc" | "desc";

export interface Customer {
    id: number;
    /** The company name when there is one, otherwise "first last" — computed by the API. */
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    /** Derived here, not sent: the avatar falls back to initials when there is no image. */
    initials: string;
    companyName: string | null;
    email: string;
    phone: string | null;
    /** Raw MinIO object key — resolve with resolveMediaUrl() before rendering. */
    image: string | null;
    taxNumber: string | null;
    status: CustomerStatus;
    createdAt: string;
    updatedAt: string;
}

/** What the API is asked for. `skip`/`limit` mirror the wire; the URL carries a 1-based page. */
export interface CustomerListParams {
    search?: string;
    status?: CustomerStatus;
    sortBy: CustomerSortField;
    order: SortOrder;
    skip: number;
    limit: number;
}

export interface CustomerListResult {
    customers: Customer[];
    total: number;
    skip: number;
    limit: number;
}
