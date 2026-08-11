"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { ShippingAddress } from "@/src/features/orders/types/order";

type AddressContextValue = {
    savedAddress: ShippingAddress | null;
    saveAddress: (address: ShippingAddress) => void;
};

const ADDRESS_STORAGE_KEY = "angkor-customer-address";
const AddressContext = createContext<AddressContextValue | null>(null);

function isShippingAddress(value: unknown): value is ShippingAddress {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as ShippingAddress).fullName === "string" &&
        typeof (value as ShippingAddress).phone === "string" &&
        typeof (value as ShippingAddress).address === "string" &&
        typeof (value as ShippingAddress).city === "string"
    );
}

function readStoredAddress(): ShippingAddress | null {
    try {
        const raw: unknown = JSON.parse(localStorage.getItem(ADDRESS_STORAGE_KEY) ?? "null");
        return isShippingAddress(raw) ? raw : null;
    } catch {
        return null;
    }
}

/**
 * Still browser-local: `GET/POST /storefront/addresses` is planned but not implemented
 * (CORE_API_ENDPOINTS.md), so only the customer profile moved to the API. The signed-in
 * customer now comes from `useCurrentCustomer`, not from here.
 */
export function AddressProviderConfig({ children }: { readonly children: ReactNode }) {
    const [savedAddress, setSavedAddress] = useState<ShippingAddress | null>(null);

    useEffect(() => {
        // Restoring a browser-only value necessarily happens after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedAddress(readStoredAddress());
    }, []);

    const saveAddress = useCallback((next: ShippingAddress) => {
        try {
            localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Storage full or unavailable — keep the in-memory address usable.
        }
        setSavedAddress(next);
    }, []);

    const value = useMemo(() => ({ savedAddress, saveAddress }), [savedAddress, saveAddress]);

    return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useSavedAddress() {
    const context = useContext(AddressContext);

    if (!context) {
        throw new Error("useSavedAddress must be used inside AddressProviderConfig");
    }

    return context;
}
