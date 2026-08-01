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

import type { CartItem } from "../types/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (productId: number, size: string, quantity?: number) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "angkor-customer-cart";
const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CartItem).productId === "number" &&
    typeof (value as CartItem).size === "string" &&
    typeof (value as CartItem).quantity === "number"
  );
}

function readStoredCart(): CartItem[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) && raw.every(isCartItem) ? raw : [];
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

  const addItem = useCallback((productId: number, size: string, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId && item.size === size);
      const next = existing
        ? current.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...current, { productId, size, quantity }];

      persistCart(next);
      return next;
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((productId: number, size: string) => {
    setItems((current) => {
      const next = current.filter((item) => !(item.productId === productId && item.size === size));
      persistCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: number, size: string, quantity: number) => {
    setItems((current) => {
      const next =
        quantity <= 0
          ? current.filter((item) => !(item.productId === productId && item.size === size))
          : current.map((item) =>
              item.productId === productId && item.size === size ? { ...item, quantity } : item,
            );

      persistCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    persistCart([]);
  }, []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      isOpen,
      setOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, isOpen, addItem, removeItem, updateQuantity, clearCart],
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
