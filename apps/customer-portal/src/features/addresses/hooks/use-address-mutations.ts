"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from "../api/address-api";
import { addressKeys } from "../lib/query-keys";
import type { CreateAddressPayload, UpdateAddressPayload } from "../types/address";

/**
 * Every mutation invalidates the list rather than patching the cache: the API owns rules the
 * client cannot replay from one response — one default per customer, the promotion that
 * follows deleting it, and the default-first ordering.
 */
function useInvalidateAddresses() {
    const queryClient = useQueryClient();

    return () => queryClient.invalidateQueries({ queryKey: addressKeys.list() });
}

export function useCreateAddress() {
    const invalidateAddresses = useInvalidateAddresses();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (payload: CreateAddressPayload) => createAddress(apiBaseUrl, payload),
        onSuccess: invalidateAddresses
    });
}

export function useUpdateAddress() {
    const invalidateAddresses = useInvalidateAddresses();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: ({ addressId, payload }: { addressId: number; payload: UpdateAddressPayload }) =>
            updateAddress(apiBaseUrl, addressId, payload),
        onSuccess: invalidateAddresses
    });
}

export function useSetDefaultAddress() {
    const invalidateAddresses = useInvalidateAddresses();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (addressId: number) => setDefaultAddress(apiBaseUrl, addressId),
        onSuccess: invalidateAddresses
    });
}

export function useDeleteAddress() {
    const invalidateAddresses = useInvalidateAddresses();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (addressId: number) => deleteAddress(apiBaseUrl, addressId),
        onSuccess: invalidateAddresses
    });
}
