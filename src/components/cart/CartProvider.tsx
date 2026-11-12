"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/auth/AuthProvider";
import type { CartLine, Product, WishlistItem } from "@/types/product";

const STORAGE_PREFIX = "acute-cart";
const MAX_QTY = 10;

const lineKey = (id: string, size?: string) => (size ? `${id}:${size}` : id);

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  /** True once the saved cart has been restored from localStorage. */
  hydrated: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product | WishlistItem, size?: string) => void;
  /** Lines are addressed by `key` (product id + size). */
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  // One saved cart per account; public visitors have no cart at all.
  const storageKey = user ? `${STORAGE_PREFIX}:${user.id}` : null;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Which key `lines` was loaded from — saving is skipped until it matches,
  // so switching accounts never writes one user's cart under another's key.
  const [loadedKey, setLoadedKey] = useState<string | null | undefined>(undefined);
  const hydrated = loadedKey === storageKey;

  // Restore the cart after mount / account switch (localStorage isn't available during SSR).
  useEffect(() => {
    let saved: CartLine[] = [];
    if (storageKey) {
      try {
        saved = (JSON.parse(localStorage.getItem(storageKey) ?? "[]") as CartLine[]).map((l) => ({
          ...l,
          // Carts saved before sizes existed have no key
          key: l.key ?? lineKey(l.id, l.size),
        }));
      } catch {
        // Corrupt or blocked storage — start with an empty cart.
      }
    }
    setLines(saved);
    setLoadedKey(storageKey);
    setIsOpen(false);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || loadedKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {
      // Storage unavailable (private mode) — cart still works for this session.
    }
  }, [lines, storageKey, loadedKey]);

  const canShop = Boolean(user);

  const add = useCallback(
    (product: Product | WishlistItem, size?: string) => {
      if (!canShop) return;
      const key = lineKey(product.id, size);
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) =>
            l.key === key ? { ...l, quantity: Math.min(l.quantity + 1, MAX_QTY) } : l,
          );
        }
        const { id, name, price, category, image_url } = product;
        return [...prev, { key, id, name, price, category, image_url, size, quantity: 1 }];
      });
    },
    [canShop],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, MAX_QTY) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const open = useCallback(() => canShop && setIsOpen(true), [canShop]);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      isOpen,
      hydrated,
      open,
      close,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, isOpen, hydrated, open, close, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
