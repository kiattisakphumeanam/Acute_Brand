"use client";

import { useRef } from "react";
import type { Currency } from "@/data/storefront";
import { useUI } from "@/lib/ui-store";

/** Seeds the store with the currency from the cookie, before the first client render reads it. */
export function CurrencyInit({ currency }: { currency: Currency }) {
  const done = useRef(false);
  if (!done.current) {
    useUI.setState({ currency });
    done.current = true;
  }
  return null;
}
