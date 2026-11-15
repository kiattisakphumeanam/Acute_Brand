"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductTag } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { usePrice, useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

/** Main photo with arrows + thumbnail strip. Shared by the quick view and the product page. */
export function ProductGallery({ product, sizes, priority }: { product: Product; sizes: string; priority?: boolean }) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState(0);
  const images = product.images ?? [];

  return (
    <div className="flex flex-col bg-acute-cream-light">
      {/* Square to match the product photography, so nothing (e.g. the size chart) is cropped */}
      <div className="relative aspect-square">
        <ProductImage
          src={images[photo] ?? product.image_url}
          alt={product.name}
          category={product.category}
          sizes={sizes}
          priority={priority}
        />
        <ProductTag product={product} className="absolute left-4 top-4" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setPhoto((photo - 1 + images.length) % images.length)}
              aria-label={t.quick.prevPhoto}
              className="hex absolute left-3 top-1/2 flex h-10 w-11 -translate-y-1/2 items-center justify-center bg-acute-cream/90 transition-colors hover:bg-acute-red hover:text-acute-cream"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setPhoto((photo + 1) % images.length)}
              aria-label={t.quick.nextPhoto}
              className="hex absolute right-3 top-1/2 flex h-10 w-11 -translate-y-1/2 items-center justify-center bg-acute-cream/90 transition-colors hover:bg-acute-red hover:text-acute-cream"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto p-3">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                onClick={() => setPhoto(i)}
                aria-label={`${product.name} ${i + 1}/${images.length}`}
                aria-current={photo === i}
                className={cn(
                  "relative block h-16 w-16 overflow-hidden rounded-[0.625rem_0.625rem_0_0.625rem] border-2 transition-colors",
                  photo === i ? "border-acute-red" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Name, price, colour/size pickers and the add-to-bag button.
 * `onDone` runs after any action that should dismiss the surrounding view (the quick view closes; the page ignores it).
 */
export function ProductPurchase({
  product,
  onDone,
  headingLevel = "h2",
}: {
  product: Product;
  onDone?: () => void;
  headingLevel?: "h1" | "h2";
}) {
  const showToast = useUI((s) => s.showToast);
  const user = useUser();
  const { add, open: openCart } = useCart();
  const { t } = useTranslation();
  const price = usePrice();
  const [color, setColor] = useState(0);
  const [size, setSize] = useState<string | null>(null);

  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const soldOutSizes = product.sold_out_sizes ?? [];
  const status = product.status ?? "active";
  const needsSize = sizes.length > 0;
  const Heading = headingLevel;

  const addToBag = () => {
    if (needsSize && !size) return;
    add(product, size ?? undefined);
    showToast(t.quick.addedToast(product.name));
    onDone?.();
    openCart();
  };

  return (
    <>
      <p className="eyebrow">{t.categories[product.category]}</p>
      <Heading className="caps mt-3 text-[2.375rem] tab:text-[2.75rem]">{product.name}</Heading>
      <p className="mt-4 text-lg">{price(product.price)}</p>
      <p className="mt-5 text-[0.9375rem] leading-relaxed text-acute-ink-light">{product.description}</p>

      {colors.length > 0 && (
        <fieldset className="mt-7">
          <legend className="text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em]">
            {t.quick.color}: <span className="font-light normal-case tracking-normal">{colors[color]?.name}</span>
          </legend>
          <div className="mt-3 flex gap-2.5">
            {colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setColor(i)}
                aria-pressed={color === i}
                aria-label={c.name}
                className={cn(
                  "h-8 w-8 rounded-full border-2 p-[0.1875rem] transition-colors",
                  color === i ? "border-acute-red" : "border-transparent hover:border-acute-stone",
                )}
              >
                <span className="block h-full w-full rounded-full border border-acute-ink/15" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {needsSize && (
        <fieldset className="mt-6">
          <legend className="text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em]">{t.quick.size}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const out = soldOutSizes.includes(s);
              return (
                <button
                  key={s}
                  disabled={out}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={cn(
                    "h-11 min-w-[3.25rem] rounded-full border px-4 text-[length:max(0.75rem,10px)] font-semibold tracking-[0.12em] transition-colors",
                    size === s
                      ? "border-acute-ink bg-acute-ink text-acute-cream"
                      : "border-acute-line bg-acute-cream-light hover:border-acute-ink",
                    out && "cursor-not-allowed text-acute-stone line-through hover:border-acute-line",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex items-center gap-3 tab:mt-auto tab:pt-8">
        {status === "coming_soon" ? (
          <button
            onClick={() => {
              showToast(t.quick.notifyToast(product.name));
              onDone?.();
            }}
            className="btn-outline flex-1"
          >
            {t.quick.notifyMe}
          </button>
        ) : status === "sold_out" ? (
          <button disabled className="btn-primary flex-1">
            {t.quick.soldOut}
          </button>
        ) : !user ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`}
            onClick={onDone}
            className="btn-outline flex-1"
          >
            {t.quick.signInToBuy}
          </Link>
        ) : (
          <button onClick={addToBag} disabled={needsSize && !size} className="btn-primary flex-1">
            {needsSize && !size ? t.quick.selectSize : t.quick.addToBag}
          </button>
        )}
      </div>
    </>
  );
}
