"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { ProductImage } from "@/components/product/ProductImage";
import { useCart } from "@/components/cart/CartProvider";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { getMyMemberStatus } from "@/app/actions/membership";
import { FREE_TOTE_THB } from "@/data/storefront";
import { memberDiscount, pointsFor, type MemberStatus } from "@/lib/membership";
import { usePrice } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { lines, subtotal, count, isOpen, close, setQuantity, remove } = useCart();
  const { t: { cart: t, categories } } = useTranslation();
  const price = usePrice();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<MemberStatus | null>(null);

  // Re-checked each time the bag opens — a finished order or a new membership changes the discount
  useEffect(() => {
    if (!isOpen) return;
    let live = true;
    getMyMemberStatus()
      .then((status) => live && setMember(status))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [isOpen]);

  // Escape to close + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const checkout = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(
        lines.map(({ id, quantity, size }) => ({ id, quantity, size })),
      );
      if ("url" in result) window.location.assign(result.url);
      else setError(result.error);
    });
  };

  const toteProgress = Math.min(subtotal / FREE_TOTE_THB, 1);
  const remaining = Math.max(FREE_TOTE_THB - subtotal, 0);

  // Same rule checkout applies (src/lib/membership.ts), so the total here is what Stripe charges
  const discount = memberDiscount(subtotal, member);
  const total = subtotal - (discount?.amount ?? 0);
  const points = pointsFor(subtotal, member);

  return (
    <div className={cn("fixed inset-0 z-[60] overflow-hidden", !isOpen && "pointer-events-none")} inert={!isOpen}>
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-acute-ink/40 transition-opacity duration-500 ease-soft",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogLabel}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-[27.5rem] flex-col bg-acute-cream transition-[transform,box-shadow] duration-500 ease-soft",
          // Shadow only while open — off-screen it would still bleed onto the page's right edge
          isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full shadow-none",
        )}
      >
        <header className="flex items-center justify-between border-b border-acute-line px-6 py-5">
          <h2 className="caps text-[1.75rem]">
            {t.title} <span className="text-acute-stone">({count})</span>
          </h2>
          <button
            onClick={close}
            aria-label={t.close}
            className="hex flex h-10 w-10 items-center justify-center bg-acute-blue transition-colors hover:bg-acute-red hover:text-acute-cream"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>

        {/* Free tote progress */}
        <div className="border-b border-acute-line bg-acute-blue-light px-6 py-4">
          <p className="text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.16em]">
            {remaining > 0 ? t.toteProgress(price(remaining)) : t.toteUnlocked}
          </p>
          <div className="mt-3 h-[0.375rem] overflow-hidden rounded-full bg-acute-blue-dark/50">
            <div
              className="h-full rounded-full bg-acute-red transition-[width] duration-700 ease-soft"
              style={{ width: `${toteProgress * 100}%` }}
            />
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="caps text-[1.625rem]">{t.empty}</p>
            <p className="max-w-xs text-sm leading-relaxed text-acute-ink-light">{t.emptyBody}</p>
            <a href="/#shop" onClick={close} className="btn-primary">
              {t.browse}
            </a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-acute-line overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-[0.875rem_0.875rem_0_0.875rem]">
                    <ProductImage
                      src={line.image_url}
                      alt={line.name}
                      category={line.category}
                      sizes="80px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-serif text-lg leading-tight">{line.name}</p>
                        <p className="mt-1 text-xs text-acute-ink-light">
                          {categories[line.category]}
                          {line.size && ` · ${t.size} ${line.size}`}
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-sm">{price(line.price * line.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-acute-line bg-acute-cream-light">
                        <button
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          aria-label={t.decrease(line.name)}
                          className="p-2.5 hover:text-acute-red"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs tabular-nums">{line.quantity}</span>
                        <button
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          aria-label={t.increase(line.name)}
                          className="p-2.5 hover:text-acute-red"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(line.key)}
                        className="text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-stone underline-offset-4 hover:text-acute-red hover:underline"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-acute-line px-6 py-6">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-acute-ink-light">{t.subtotal}</dt>
                  <dd className="tabular-nums">{price(subtotal)}</dd>
                </div>
                {discount && (
                  <div className="flex justify-between gap-4 text-acute-red">
                    <dt>
                      {discount.kind === "first_order"
                        ? t.discountFirst(discount.rate * 100)
                        : t.discountTier(discount.tier, discount.rate * 100)}
                    </dt>
                    <dd className="tabular-nums">−{price(discount.amount)}</dd>
                  </div>
                )}
                {/* Right under the discount, so members see both perks of this order together */}
                {member?.member && points > 0 && (
                  <div className="flex justify-between gap-4 text-acute-red">
                    <dt>{t.pointsEarned}</dt>
                    <dd className="tabular-nums">{t.pointsValue(points.toLocaleString())}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-4 border-t border-acute-line pt-3">
                  <dt className="eyebrow">{t.total}</dt>
                  <dd className="font-serif text-2xl tabular-nums">{price(total)}</dd>
                </div>
              </dl>

              {/* Non-members see what joining is worth */}
              <p className={cn("mt-3 flex items-baseline gap-4 text-xs", member?.member ? "justify-end" : "justify-between")}>
                {!member?.member && <span className="text-acute-ink-light">{t.joinForDiscount}</span>}
                <Link
                  href="/membership"
                  onClick={close}
                  className="shrink-0 text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-ink-light underline-offset-4 hover:text-acute-red hover:underline"
                >
                  {t.memberDetails}
                </Link>
              </p>
              <p className="mt-1.5 text-xs text-acute-ink-light">{t.shippingNote}</p>
              {error && (
                <p role="alert" className="mt-4 text-sm text-acute-red">
                  {error}
                </p>
              )}
              <button onClick={checkout} disabled={isPending} className="btn-primary mt-5 w-full">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? t.redirecting : t.checkout}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
