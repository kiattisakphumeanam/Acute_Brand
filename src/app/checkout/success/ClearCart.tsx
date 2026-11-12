"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** Empties the bag once Stripe redirects back after a successful payment. */
export function ClearCart() {
  const { clear, hydrated } = useCart();
  // Wait for the saved cart to load first, otherwise the restore would undo the clear.
  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);
  return null;
}
