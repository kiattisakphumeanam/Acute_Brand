"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductImage } from "@/components/product/ProductImage";
import { usePrice, useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

/** Full-width search panel. Matches name, category (in both languages) and colour names. */
export function SearchOverlay({ products }: { products: Product[] }) {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const openQuickView = useUI((s) => s.openQuickView);
  const { t } = useTranslation();
  const price = usePrice();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) =>
      [p.name, p.category, t.categories[p.category], ...(p.colors ?? []).map((c) => c.name)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [deferred, products, t]);

  return (
    <div className={cn("fixed inset-0 z-[65]", !open && "pointer-events-none")} inert={!open}>
      <div
        onClick={() => setOpen(false)}
        className={cn("absolute inset-0 bg-acute-ink/40 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.search.open}
        className={cn(
          "absolute inset-x-0 top-0 max-h-[85vh] overflow-y-auto bg-acute-cream transition-transform duration-500 ease-soft",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="container-acute py-6 desk:py-10">
          <div className="flex items-center gap-4 border-b border-acute-ink pb-4">
            <Search className="h-5 w-5 shrink-0 text-acute-red" strokeWidth={1.5} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              aria-label={t.search.placeholder}
              className="min-w-0 flex-1 bg-transparent font-serif text-[24px] outline-none placeholder:text-acute-stone tab:text-[32px]"
            />
            <button
              onClick={() => setOpen(false)}
              aria-label={t.search.close}
              className="hex flex h-10 w-11 shrink-0 items-center justify-center bg-acute-blue transition-colors hover:bg-acute-red hover:text-acute-cream"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {!deferred.trim() ? (
            <div className="mt-6">
              <p className="eyebrow">{t.search.popular}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.search.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-acute-line bg-acute-cream-light px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] hover:border-acute-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="eyebrow" aria-live="polite">
                {results.length ? t.search.results(results.length) : t.search.empty}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-4 tab:grid-cols-4 desk:grid-cols-6">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        openQuickView(p);
                      }}
                      className="group w-full text-left"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-card">
                        <ProductImage src={p.image_url} alt={p.name} category={p.category} sizes="200px" />
                      </div>
                      <p className="mt-2 font-serif text-[17px] leading-tight group-hover:text-acute-red">{p.name}</p>
                      <p className="mt-0.5 text-xs text-acute-ink-light">{price(p.price)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
