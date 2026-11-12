"use client";

import { Heart } from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import type { Product, WishlistItem } from "@/types/product";

/** Hexagon heart toggle overlaid on a product image. */
export function WishlistButton({
  product,
  className,
}: {
  product: Product | WishlistItem;
  className?: string;
}) {
  const { t } = useTranslation();
  const { has, toggle } = useWishlist();
  const showToast = useUI((s) => s.showToast);
  const saved = has(product.id);

  return (
    <button
      onClick={() => {
        toggle(product);
        showToast(saved ? t.quick.unsavedToast : t.quick.savedToast);
      }}
      aria-pressed={saved}
      aria-label={saved ? t.product.unsaveAria(product.name) : t.product.saveAria(product.name)}
      className={cn(
        "hex flex h-10 w-11 items-center justify-center bg-acute-cream/90 transition-colors duration-300 hover:bg-acute-red hover:text-acute-cream",
        saved && "bg-acute-red text-acute-cream",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={1.5} />
    </button>
  );
}
