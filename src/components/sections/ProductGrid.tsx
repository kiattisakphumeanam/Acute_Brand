"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryTabs, type CategoryOption } from "@/components/product/CategoryTabs";
import { ProductCard } from "@/components/product/ProductCard";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category, type Moment, type Product } from "@/types/product";

interface Props {
  products: Product[];
  initialCategory?: Category | "all";
  /** Home page: one row of simplified cards and a link to /products, without the category filter. */
  preview?: boolean;
  /** /products?moment=…: products are already filtered; titles the page and links back to everything. */
  moment?: Moment;
}

export function ProductGrid({ products, initialCategory = "all", preview = false, moment }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState<Category | "all">(initialCategory);

  const options = useMemo<CategoryOption[]>(
    () => [
      { value: "all", label: t.catalog.all, count: products.length },
      // Every category always has a tab, even before it has products
      ...CATEGORIES.map((c) => ({
        value: c,
        label: t.categories[c],
        count: products.filter((p) => p.category === c).length,
      })),
    ],
    [products, t],
  );

  const visible = active === "all" ? products : products.filter((p) => p.category === active);

  // Preview shows one row at every breakpoint: 2, 3 and 4 columns → 2, 3 and 4 cards
  const hiddenFrom = (i: number) =>
    !preview ? "" : i >= 4 ? "hidden" : i >= 3 ? "hidden desk:block" : i >= 2 ? "hidden tab:block" : "";
  // "See all" only shows at the breakpoints where some products are hidden
  const seeMoreClass =
    visible.length > 4 ? "" : visible.length > 3 ? "desk:hidden" : visible.length > 2 ? "tab:hidden" : null;

  return (
    <section id="shop" className={cn("container-acute", preview ? "pb-12 pt-8 tab:pb-14 tab:pt-10 desk:pb-16 desk:pt-12" : "pb-12 pt-10 tab:pt-12 desk:pb-16 desk:pt-14")}>
      {/* Home: no visible heading, the products lead straight on from the hero */}
      {preview ? (
        <h2 className="sr-only">{t.home.shop.title}</h2>
      ) : (
        <div className="rv flex flex-col justify-between gap-6 desk:flex-row desk:items-end">
          <div>
            <p className="eyebrow">{moment ? t.home.moments.title : t.home.shop.eyebrow}</p>
            <h1 className="heading-section mt-3">{moment ?? t.home.shop.title}</h1>
            {moment && (
              <>
                <p className="mt-3 max-w-md text-[0.875rem] leading-snug text-acute-ink-light">
                  {t.home.moments.items[moment]}
                </p>
                <Link href="/products" className="btn-ghost mt-5">
                  {t.catalog.seeMore}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
          <CategoryTabs options={options} active={active} onChange={setActive} label={t.catalog.filterLabel} />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 text-sm text-acute-ink-light">{t.catalog.empty}</p>
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-2 gap-x-3 gap-y-8 tab:grid-cols-3 tab:gap-x-5 desk:grid-cols-4 desk:gap-x-6 desk:gap-y-10",
              !preview && "mt-8 tab:mt-10",
            )}
          >
            {visible.map((product, i) => (
              <div key={product.id} className={hiddenFrom(i)}>
                <ProductCard product={product} minimal={preview} />
              </div>
            ))}
          </div>
          {preview && seeMoreClass !== null && (
            <div className={cn("mt-6 flex justify-center tab:mt-8", seeMoreClass)}>
              <Link href="/products" className="btn-outline group">
                {t.catalog.seeMore}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
