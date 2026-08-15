"use client";

import { useQuery } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { fetchAddresses } from "../api/address-api";
import { addressKeys } from "../lib/query-keys";
import type { CustomerAddress } from "../types/address";

/**
 * Held back until `/me` says somebody is signed in: the endpoint is customer-scoped, and
 * checkout renders this for anonymous shoppers too, where the call is a guaranteed 401.
 */
export function useAddressesQuery() {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: addressKeys.list(),
        queryFn: () => fetchAddresses(apiBaseUrl),
        enabled: Boolean(customer),
        staleTime: 5 * 60 * 1000
    });
}

/** The list on its own, defaulted to empty — the common case for shaping helpers. */
export function useAddresses(): CustomerAddress[] {
    return useAddressesQuery().data ?? [];
}

/** Where checkout starts from: the customer's default, or the only address they have. */
export function useDefaultAddress(): CustomerAddress | null {
    const addresses = useAddresses();

    return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}
