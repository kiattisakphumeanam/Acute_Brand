"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useUser } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductImage } from "@/components/product/ProductImage";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { formatTHB } from "@/lib/utils";

export function WishlistView() {
  const user = useUser();
  const { t } = useTranslation();
  const { add } = useCart();
  const { items, hydrated } = useWishlist();

  return (
    <section className="container-acute py-32">
      <p className="eyebrow">{t.wishlist.eyebrow}</p>
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">
        {t.wishlist.title} {hydrated && <span className="text-acute-ink/40">({items.length})</span>}
      </h1>

      {!hydrated ? null : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-start gap-6">
          <p className="font-serif text-xl uppercase tracking-tight">{t.wishlist.empty}</p>
          <p className="max-w-xs text-sm leading-relaxed text-acute-ink/60">{t.wishlist.emptyBody}</p>
          <Link href="/#shop" className="btn-ghost">
            {t.wishlist.browse}
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {items.map((item) => (
            <article key={item.id} className="group flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden">
                <ProductImage src={item.image_url} alt={item.name} category={item.category} />
                <WishlistButton product={item} className="absolute right-3 top-3" />
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <p className="mt-1 text-xs text-acute-ink/50">{t.categories[item.category]}</p>
                </div>
                <p className="text-sm tabular-nums">{formatTHB(item.price)}</p>
              </div>

              {!user ? (
                <Link
                  href={`/login?next=${encodeURIComponent("/wishlist")}`}
                  className="btn-outline mt-4 w-full py-3"
                >
                  {t.product.signInToShop}
                </Link>
              ) : (
                <button
                  onClick={() => add(item)}
                  className="btn-primary mt-4 w-full py-3"
                  aria-label={t.product.addAria(item.name)}
                >
                  <Plus className="h-3.5 w-3.5" /> {t.product.addToCart}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
