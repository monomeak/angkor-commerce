"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { CartItem, CartLineInput } from "../types/cart";
import { cartItemCount, cartSubtotal } from "./cart-helpers";

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    addItem: (line: CartLineInput, quantity?: number) => void;
    removeItem: (variantId: number) => void;
    updateQuantity: (variantId: number, quantity: number) => void;
    clearCart: () => void;
};

const CART_STORAGE_KEY = "angkor-customer-cart";
const CartContext = createContext<CartContextValue | null>(null);

/**
 * Also the migration: the pre-core-api cart stored mock product ids and a size string with no
 * variant. Those lines fail this check and are dropped, rather than being sent to an API that
 * would reject the ids anyway.
 */
function isCartItem(value: unknown): value is CartItem {
    const item = value as CartItem;

    return (
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "number" &&
        typeof item.variantId === "number" &&
        typeof item.quantity === "number" &&
        typeof item.name === "string" &&
        typeof item.unitPrice === "number"
    );
}

function readStoredCart(): CartItem[] {
    try {
        const raw: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
        return Array.isArray(raw) ? raw.filter(isCartItem) : [];
    } catch {
        return [];
    }
}

function persistCart(items: CartItem[]) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProviderConfig({ children }: { readonly children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        // Restoring a browser-only cart necessarily happens after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(readStoredCart());
    }, []);

    const addItem = useCallback((line: CartLineInput, quantity = 1) => {
        setItems((current) => {
            const existing = current.find((item) => item.variantId === line.variantId);
            // The snapshot is refreshed on a repeat add, so a price change since the first one
            // shows up rather than being pinned to whatever the cart saw first.
            const next = existing
                ? current.map((item) =>
                      item.variantId === line.variantId
                          ? { ...line, quantity: item.quantity + quantity }
                          : item
                  )
                : [...current, { ...line, quantity }];

            persistCart(next);
            return next;
        });
        setOpen(true);
    }, []);

    const removeItem = useCallback((variantId: number) => {
        setItems((current) => {
            const next = current.filter((item) => item.variantId !== variantId);
            persistCart(next);
            return next;
        });
    }, []);

    const updateQuantity = useCallback((variantId: number, quantity: number) => {
        setItems((current) => {
            const next =
                quantity <= 0
                    ? current.filter((item) => item.variantId !== variantId)
                    : current.map((item) => (item.variantId === variantId ? { ...item, quantity } : item));

            persistCart(next);
            return next;
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        persistCart([]);
    }, []);

    const value = useMemo(
        () => ({
            items,
            itemCount: cartItemCount(items),
            subtotal: cartSubtotal(items),
            isOpen,
            setOpen,
            addItem,
            removeItem,
            updateQuantity,
            clearCart
        }),
        [items, isOpen, addItem, removeItem, updateQuantity, clearCart]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProviderConfig");
    }

    return context;
}
