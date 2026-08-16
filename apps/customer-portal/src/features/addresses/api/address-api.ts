import { apiFetch, parseResponse } from "@/lib/api-client";
import { addressDtoSchema, addressListDtoSchema } from "../schemas/address-api.schema";
import type { CreateAddressPayload, CustomerAddress, UpdateAddressPayload } from "../types/address";

const ADDRESSES_BASE = "/storefront/addresses";

/**
 * The whole book in one call — a customer keeps at most three. core-api scopes every row to
 * the session's customer and orders them default-first, newest-first, which is the order the
 * UI shows them in.
 */
export async function fetchAddresses(apiBaseUrl: string): Promise<CustomerAddress[]> {
    const data = await apiFetch<unknown>(apiBaseUrl, ADDRESSES_BASE);

    return parseResponse(addressListDtoSchema, data);
}

/** A customer's first address is made the default by the API, whatever the payload says. */
export async function createAddress(apiBaseUrl: string, payload: CreateAddressPayload): Promise<CustomerAddress> {
    const data = await apiFetch<unknown>(apiBaseUrl, ADDRESSES_BASE, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return parseResponse(addressDtoSchema, data);
}

export async function updateAddress(
    apiBaseUrl: string,
    addressId: number,
    payload: UpdateAddressPayload
): Promise<CustomerAddress> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${ADDRESSES_BASE}/${addressId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
    });

    return parseResponse(addressDtoSchema, data);
}

/** Clears the previous default in the same transaction — only one can hold it. */
export async function setDefaultAddress(apiBaseUrl: string, addressId: number): Promise<CustomerAddress> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${ADDRESSES_BASE}/${addressId}/default`, { method: "PUT" });

    return parseResponse(addressDtoSchema, data);
}

/**
 * Soft delete: the row is marked DELETED so placed orders keep pointing at it. Deleting the
 * default promotes the oldest remaining address, so the list has to be refetched afterwards.
 */
export async function deleteAddress(apiBaseUrl: string, addressId: number): Promise<void> {
    await apiFetch<void>(apiBaseUrl, `${ADDRESSES_BASE}/${addressId}`, { method: "DELETE" });
}
