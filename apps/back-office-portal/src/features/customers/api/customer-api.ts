import { apiFetch, parseResponse } from "@/lib/api-client";
import { mapCustomer, mapCustomerList } from "../mappers/customer.mapper";
import { customerDtoSchema, customerListDtoSchema } from "../schemas/customer-api.schema";
import type { Customer, CustomerListParams, CustomerListResult } from "../types/customer";

/*
 * The only place the customer directory talks HTTP. Components go through hooks, hooks call
 * these. apiBaseUrl is passed in because it comes from <AppConfigProvider> via useAppConfig(),
 * which can only be read inside a hook or component.
 *
 * `/customers` is staff-only in core-api's SecurityConfig — a customer's own session cannot
 * reach it, and an expired staff one is refreshed once inside apiFetch.
 */

const CUSTOMERS_BASE = "/customers";

/**
 * The search parameter is `search` here, not `q` as on `/products` — it is what this endpoint
 * has always taken. It matches the full name, either half of it, the email, the phone or the
 * company in one predicate.
 *
 * Empty values are dropped rather than sent blank: `?status=` fails enum conversion with a
 * 400 rather than being read as "no filter".
 */
function toSearchParams(params: CustomerListParams): string {
    const search = new URLSearchParams();

    search.set("skip", String(params.skip));
    search.set("limit", String(params.limit));
    search.set("sortBy", params.sortBy);
    search.set("order", params.order);

    if (params.search) search.set("search", params.search);
    if (params.status) search.set("status", params.status);

    return search.toString();
}

export async function fetchCustomers(apiBaseUrl: string, params: CustomerListParams): Promise<CustomerListResult> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${CUSTOMERS_BASE}?${toSearchParams(params)}`);

    return mapCustomerList(parseResponse(customerListDtoSchema, data));
}

export async function fetchCustomer(apiBaseUrl: string, id: number): Promise<Customer> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${CUSTOMERS_BASE}/${id}`);

    return mapCustomer(parseResponse(customerDtoSchema, data));
}
