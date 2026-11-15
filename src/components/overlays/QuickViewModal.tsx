"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductGallery, ProductPurchase } from "@/components/product/ProductDetails";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

export function QuickViewModal() {
  const product = useUI((s) => s.quickView);
  const close = useUI((s) => s.closeQuickView);
  const { t } = useTranslation();

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, close]);

  return (
    <div className={cn("fixed inset-0 z-[70] flex items-end justify-center tab:items-center", !product && "pointer-events-none")} inert={!product}>
      <div
        onClick={close}
        className={cn("absolute inset-0 bg-acute-ink/45 transition-opacity duration-500", product ? "opacity-100" : "opacity-0")}
      />
      {product && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className="relative grid max-h-[92vh] w-full animate-fade-up overflow-y-auto rounded-t-[1.375rem] bg-acute-cream tab:mx-6 tab:max-w-[57.5rem] tab:grid-cols-2 tab:rounded-card"
        >
          <button
            onClick={close}
            aria-label={t.quick.close}
            className="hex absolute right-4 top-4 z-10 flex h-10 w-11 items-center justify-center bg-acute-cream transition-colors hover:bg-acute-red hover:text-acute-cream"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Keyed by product so photo/colour/size selections reset for each one */}
          <ProductGallery key={`g-${product.id}`} product={product} sizes="(min-width: 760px) 460px, 100vw" />

          <div className="flex flex-col p-6 tab:p-10">
            <ProductPurchase key={`p-${product.id}`} product={product} onDone={close} />
            <Link
              href={`/products/${product.slug}`}
              onClick={close}
              className="mt-5 self-start text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] underline underline-offset-4 hover:text-acute-red"
            >
              {t.quick.viewDetails}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
