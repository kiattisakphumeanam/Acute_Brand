"use client";

import { create } from "zustand";
import { CURRENCIES, CURRENCY_COOKIE, type Currency } from "@/data/storefront";
import type { Product } from "@/types/product";

interface UIState {
  searchOpen: boolean;
  memberOpen: boolean;
  quickView: Product | null;
  toast: { id: number; message: string } | null;
  currency: Currency;
  setSearchOpen: (open: boolean) => void;
  setMemberOpen: (open: boolean) => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setCurrency: (currency: Currency) => void;
}

export const useUI = create<UIState>((set) => ({
  searchOpen: false,
  memberOpen: false,
  quickView: null,
  toast: null,
  currency: "THB",
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMemberOpen: (memberOpen) => set({ memberOpen }),
  openQuickView: (quickView) => set({ quickView }),
  closeQuickView: () => set({ quickView: null }),
  showToast: (message) => set({ toast: { id: Date.now(), message } }),
  hideToast: () => set({ toast: null }),
  setCurrency: (currency) => {
    document.cookie = `${CURRENCY_COOKIE}=${currency}; path=/; max-age=31536000; samesite=lax`;
    set({ currency });
  },
}));


/** Display-only conversion; checkout always charges THB. */
export function formatPrice(thb: number, currency: Currency) {
  const { symbol, rate } = CURRENCIES[currency];
  const value = thb * rate;
  const digits = currency === "USD" || currency === "SGD" ? 2 : 0;
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function usePrice() {
  const currency = useUI((s) => s.currency);
  return (thb: number) => formatPrice(thb, currency);
}
