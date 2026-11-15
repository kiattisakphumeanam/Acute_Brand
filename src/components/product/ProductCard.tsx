"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductImage } from "@/components/product/ProductImage";
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
        "rounded-full px-3 py-[0.375rem] text-[length:max(0.625rem,10px)] font-semibold uppercase tracking-[0.2em]",
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
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-acute-sand">
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

        {/* Hover quick button */}
        <button
          onClick={() => openQuickView(product)}
          tabIndex={-1}
          className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+0.75rem)] rounded-full bg-acute-cream/95 py-3 text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] transition-[transform,background-color,color] duration-500 ease-soft hover:bg-acute-red hover:text-acute-cream group-hover:translate-y-0"
        >
          {t.quick.quickView}
        </button>
      </div>

      {/* Phones: price under the name, so the name gets the card's full width. Side by side from tablet. */}
      <div className="mt-3 flex flex-col gap-1 tab:mt-4 tab:flex-row tab:items-start tab:justify-between tab:gap-3">
        <h3 className="font-serif text-[1rem] leading-snug tab:text-[1.125rem]">
          <Link href={`/products/${product.slug}`} className="hover:text-acute-red">
            {product.name}
          </Link>
        </h3>
        <p className="whitespace-nowrap text-[length:max(0.8125rem,12px)] tabular-nums tab:pt-0.5">
          {price(product.price)}
        </p>
      </div>

      {(colors.length > 0 || sizes.length > 0) && (
        <div className="mt-auto flex items-center justify-between gap-3 pt-2.5">
          {colors.length > 0 && (
            <ul className="flex shrink-0 gap-1.5" aria-label={t.quick.colors(colors.length)}>
              {colors.map((c) => (
                <li
                  key={c.name}
                  title={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-acute-ink/15"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </ul>
          )}
          {/* Only the counts there are — no "0 colours" */}
          <p className="text-[length:max(0.6875rem,10px)] uppercase tracking-[0.14em] text-acute-stone">
            {[colors.length > 0 && t.quick.colors(colors.length), sizes.length > 0 && t.quick.sizes(sizes.length)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}
    </article>
  );
}
