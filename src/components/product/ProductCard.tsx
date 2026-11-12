"use client";

import Image from "next/image";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductImage } from "@/components/product/ProductImage";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { usePrice, useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductTag({ product, className }: { product: Product; className?: string }) {
  const { t } = useTranslation();
  const tag =
    product.status === "sold_out"
      ? { label: t.quick.soldOut, cls: "bg-acute-ink text-acute-cream" }
      : product.status === "coming_soon"
        ? { label: t.quick.comingSoon, cls: "bg-acute-blue text-acute-ink" }
        : product.is_new
          ? { label: t.quick.newArrival, cls: "bg-acute-red text-acute-cream" }
          : null;
  if (!tag) return null;
  return (
    <span
      className={cn(
        "rounded-full px-3 py-[6px] text-[10px] font-semibold uppercase tracking-[0.2em]",
        tag.cls,
        className,
      )}
    >
      {tag.label}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const price = usePrice();
  const openQuickView = useUI((s) => s.openQuickView);
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-acute-sand">
        <button
          onClick={() => openQuickView(product)}
          aria-label={`${t.quick.quickView}: ${product.name}`}
          className="absolute inset-0"
        >
          <ProductImage src={product.image_url} alt={product.name} category={product.category} />
          {/* Second photo fades in on hover */}
          {product.images?.[1] && (
            <Image
              src={product.images[1]}
              alt=""
              fill
              sizes="(min-width: 1040px) 25vw, (min-width: 760px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-soft group-hover:opacity-100"
            />
          )}
          {product.status === "sold_out" && <span className="absolute inset-0 bg-acute-cream/35" />}
        </button>

        <ProductTag product={product} className="pointer-events-none absolute left-3 top-3" />
        <WishlistButton product={product} className="absolute right-3 top-3" />

        {/* Hover quick button */}
        <button
          onClick={() => openQuickView(product)}
          tabIndex={-1}
          className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+12px)] rounded-full bg-acute-cream/95 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-[transform,background-color,color] duration-500 ease-soft hover:bg-acute-red hover:text-acute-cream group-hover:translate-y-0"
        >
          {t.quick.quickView}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-serif text-[19px] leading-tight">
          <button onClick={() => openQuickView(product)} className="text-left hover:text-acute-red">
            {product.name}
          </button>
        </h3>
        <p className="whitespace-nowrap pt-0.5 text-[13px] tabular-nums">{price(product.price)}</p>
      </div>

      {(colors.length > 0 || sizes.length > 0) && (
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <ul className="flex gap-1.5" aria-label={t.quick.colors(colors.length)}>
            {colors.map((c) => (
              <li
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full border border-acute-ink/15"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </ul>
          <p className="text-[11px] uppercase tracking-[0.14em] text-acute-stone">
            {t.quick.colors(colors.length)} · {t.quick.sizes(sizes.length)}
          </p>
        </div>
      )}
    </article>
  );
}
