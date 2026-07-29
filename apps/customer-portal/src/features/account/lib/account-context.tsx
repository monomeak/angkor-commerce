"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ShippingAddress } from "@/src/features/orders/types/order";
import { currentCustomer } from "../data/account.data";
import type { AccountCustomer } from "../types/account";

type AccountContextValue = {
  customer: AccountCustomer;
  updateCustomer: (updates: Partial<Omit<AccountCustomer, "id">>) => void;
  savedAddress: ShippingAddress | null;
  saveAddress: (address: ShippingAddress) => void;
};

const PROFILE_STORAGE_KEY = "angkor-customer-profile";
const ADDRESS_STORAGE_KEY = "angkor-customer-address";
const AccountContext = createContext<AccountContextValue | null>(null);

function isAccountCustomer(value: unknown): value is AccountCustomer {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AccountCustomer).id === "number" &&
    typeof (value as AccountCustomer).firstName === "string" &&
    typeof (value as AccountCustomer).lastName === "string" &&
    typeof (value as AccountCustomer).email === "string"
  );
}

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

function readStoredCustomer(): AccountCustomer {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? "null");
    return isAccountCustomer(raw) ? raw : currentCustomer;
  } catch {
    return currentCustomer;
  }
}

function readStoredAddress(): ShippingAddress | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(ADDRESS_STORAGE_KEY) ?? "null");
    return isShippingAddress(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function AccountProviderConfig({ children }: { readonly children: ReactNode }) {
  const [customer, setCustomer] = useState<AccountCustomer>(currentCustomer);
  const [savedAddress, setSavedAddress] = useState<ShippingAddress | null>(null);

  useEffect(() => {
    // Restoring browser-only overrides necessarily happens after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomer(readStoredCustomer());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAddress(readStoredAddress());
  }, []);

  const updateCustomer = useCallback((updates: Partial<Omit<AccountCustomer, "id">>) => {
    setCustomer((current) => {
      const next = { ...current, ...updates };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveAddress = useCallback((next: ShippingAddress) => {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
    setSavedAddress(next);
  }, []);

  const value = useMemo(
    () => ({ customer, updateCustomer, savedAddress, saveAddress }),
    [customer, updateCustomer, savedAddress, saveAddress],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccount must be used inside AccountProviderConfig");
  }

  return context;
}
