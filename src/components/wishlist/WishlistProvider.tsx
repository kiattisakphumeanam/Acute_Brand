"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product, WishlistItem } from "@/types/product";

const STORAGE_KEY = "acute-wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  /** True once the saved wishlist has been restored from localStorage. */
  hydrated: boolean;
  has: (id: string) => boolean;
  toggle: (product: Product | WishlistItem) => void;
  remove: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Unlike the cart, the wishlist works for public visitors too — it lives in this browser only.
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
    } catch {
      // Corrupt or blocked storage — start empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode) — wishlist still works for this session.
    }
  }, [items, hydrated]);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((product: Product | WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev.filter((i) => i.id !== product.id);
      const { id, name, price, category, image_url } = product;
      return [...prev, { id, name, price, category, image_url }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, hydrated, has, toggle, remove }),
    [items, hydrated, has, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
