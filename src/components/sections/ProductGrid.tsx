"use client";

import { useMemo, useState } from "react";
import { CategoryTabs, type CategoryOption } from "@/components/product/CategoryTabs";
import { ProductCard } from "@/components/product/ProductCard";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { CATEGORIES, type Category, type Product } from "@/types/product";

interface Props {
  products: Product[];
  initialCategory?: Category | "all";
}

export function ProductGrid({ products, initialCategory = "all" }: Props) {
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

  return (
    <section id="shop" className="container-acute py-20 desk:py-28">
      <div className="rv flex flex-col justify-between gap-8 desk:flex-row desk:items-end">
        <div>
          <p className="eyebrow">{t.home.shop.eyebrow}</p>
          <h2 className="caps mt-4 text-[44px] tab:text-[60px] desk:text-[72px]">{t.home.shop.title}</h2>
        </div>
        <CategoryTabs options={options} active={active} onChange={setActive} label={t.catalog.filterLabel} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-sm text-acute-ink-light">{t.catalog.empty}</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 tab:grid-cols-3 tab:gap-x-5 desk:grid-cols-4 desk:gap-x-6 desk:gap-y-14">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
