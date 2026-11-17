"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getMyMemberStatus } from "@/app/actions/membership";
import { CartTotals } from "@/components/cart/CartTotals";
import { useCart } from "@/components/cart/CartProvider";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { ProductImage } from "@/components/product/ProductImage";
import { SHIPPING_OPTIONS, type ShippingOptionId } from "@/data/storefront";
import { memberDiscount, type MemberStatus } from "@/lib/membership";
import { usePrice } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 w-full rounded-full border border-acute-line bg-acute-cream-light px-5 py-3 text-sm normal-case tracking-normal outline-none transition-colors focus:border-acute-ink";
const labelClass = "block text-xs uppercase tracking-[0.2em]";
const legendClass = "mb-6 flex w-full items-baseline gap-3 border-b border-acute-ink pb-3";
const optionClass =
  "flex cursor-pointer items-center gap-4 border-b border-acute-line py-4 text-sm transition-colors hover:text-acute-red has-[:checked]:text-acute-ink";

/** Numbered section title: "01 Contact" */
function Legend({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <legend className={legendClass}>
      <span className="font-serif text-lg tabular-nums text-acute-red">{String(n).padStart(2, "0")}</span>
      <span className="eyebrow text-acute-ink">{children}</span>
    </legend>
  );
}

type Method = "card" | "promptpay";

/**
 * /checkout: contact, address, delivery and payment on one page, straight from the bag.
 * Payment is still a mockup until Stripe's Payment Element is wired in — nothing is charged or saved,
 * and "Pay" goes to the success page in preview mode, which keeps the bag.
 */
export function CheckoutForm({ email, fullName }: { email: string; fullName: string | null }) {
  const router = useRouter();
  const { lines, subtotal, hydrated, open: openBag } = useCart();
  const { t: { payment: t, checkout, cart, categories } } = useTranslation();
  const price = usePrice();
  const [member, setMember] = useState<MemberStatus | null>(null);
  const [shippingId, setShippingId] = useState<ShippingOptionId>("standard");
  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let live = true;
    getMyMemberStatus()
      .then((status) => live && setMember(status))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const shipping = SHIPPING_OPTIONS.find((o) => o.id === shippingId)?.priceTHB ?? 0;
  const total = subtotal - (memberDiscount(subtotal, member)?.amount ?? 0) + shipping;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    // Stands in for the round trip to Stripe
    setTimeout(() => router.push("/checkout/success?preview=1"), 1200);
  };

  return (
    <section className="container-acute pb-12 pt-10 tab:pt-12 desk:pb-16 desk:pt-14">
      <p className="mb-8 border-b border-acute-line pb-3 text-xs text-acute-ink-light">{t.preview}</p>

      <div className="flex flex-col justify-between gap-6 tab:flex-row tab:items-end">
        <div>
          <p className="eyebrow">{checkout.eyebrow}</p>
          <h1 className="heading-section mt-3">{t.title}</h1>
        </div>
        {/* Quantities are edited in the bag, which opens over this page */}
        <button type="button" onClick={openBag} className="btn-ghost self-start tab:self-auto">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t.back}
        </button>
      </div>

      {!hydrated ? null : lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-5 border-t border-acute-line pt-10 desk:mt-14">
          <p className="caps text-[1.625rem]">{cart.empty}</p>
          <p className="max-w-sm text-sm leading-relaxed text-acute-ink-light">{cart.emptyBody}</p>
          <Link href="/products" className="btn-primary mt-2">
            {cart.browse}
          </Link>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mt-10 grid gap-12 desk:mt-14 desk:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] desk:gap-16 wide:gap-24"
        >
          <div className="space-y-12 desk:max-w-[44rem]">
            <fieldset disabled={processing}>
              <Legend n={1}>{t.contact}</Legend>
              <div className="grid gap-5 tab:grid-cols-2">
                <label className={labelClass}>
                  {t.email}
                  <input type="email" required autoComplete="email" defaultValue={email} className={inputClass} />
                </label>
                <label className={labelClass}>
                  {t.phone}
                  <input type="tel" required autoComplete="tel" className={inputClass} />
                </label>
              </div>
            </fieldset>

            <fieldset disabled={processing}>
              <Legend n={2}>{t.address}</Legend>
              <div className="grid gap-5 tab:grid-cols-2">
                <label className={cn(labelClass, "tab:col-span-2")}>
                  {t.fullName}
                  <input required autoComplete="name" defaultValue={fullName ?? ""} className={inputClass} />
                </label>
                <label className={cn(labelClass, "tab:col-span-2")}>
                  {t.street}
                  <input required autoComplete="address-line1" className={inputClass} />
                </label>
                <label className={cn(labelClass, "tab:col-span-2")}>
                  {t.district}
                  <input required autoComplete="address-line2" className={inputClass} />
                </label>
                <label className={labelClass}>
                  {t.province}
                  <input required autoComplete="address-level1" className={inputClass} />
                </label>
                <label className={labelClass}>
                  {t.postcode}
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    autoComplete="postal-code"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  {t.country}
                  {/* Checkout only ships within Thailand (shipping_address_collection in actions/checkout.ts) */}
                  <input value={t.thailand} readOnly disabled className={cn(inputClass, "text-acute-ink/50")} />
                </label>
              </div>
            </fieldset>

            <fieldset disabled={processing}>
              <Legend n={3}>{t.delivery}</Legend>
              <div>
                {SHIPPING_OPTIONS.map((option) => (
                  <label key={option.id} className={optionClass}>
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={shippingId === option.id}
                      onChange={() => setShippingId(option.id)}
                      className="h-4 w-4 accent-acute-red"
                    />
                    <span className="flex-1">
                      {t.options[option.id]}
                      <span className="ml-3 text-xs text-acute-ink-light">{t.days(option.days)}</span>
                    </span>
                    <span className="tabular-nums">{option.priceTHB ? price(option.priceTHB) : cart.free}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset disabled={processing}>
              <Legend n={4}>{t.method}</Legend>
              <div>
                {(["card", "promptpay"] as const).map((m) => (
                  <div key={m} className="border-b border-acute-line">
                    <label className={cn(optionClass, "border-b-0")}>
                      <input
                        type="radio"
                        name="method"
                        value={m}
                        checked={method === m}
                        onChange={() => setMethod(m)}
                        className="h-4 w-4 accent-acute-red"
                      />
                      <span className="flex-1">{t[m]}</span>
                    </label>
                    {method === m && (
                      <div className="pb-5 pl-8">
                        {m === "card" ? (
                          <>
                            {/* Look-alike only: no inputs, so nothing typed here can be a real card number */}
                            <div aria-hidden="true" className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm text-acute-ink/40">
                              <div className="rounded-full border border-acute-line bg-acute-cream-light px-5 py-3">
                                {t.cardNumber}
                              </div>
                              <div className="rounded-full border border-acute-line bg-acute-cream-light px-5 py-3">
                                {t.expiry}
                              </div>
                              <div className="rounded-full border border-acute-line bg-acute-cream-light px-5 py-3">
                                {t.cvc}
                              </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-acute-ink-light">{t.cardNote}</p>
                          </>
                        ) : (
                          <p className="text-xs leading-relaxed text-acute-ink-light">{t.promptpayNote}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Stays beside the form on desktop; on phones it follows the form, right above Pay */}
          <aside aria-labelledby="payment-summary" className="desk:sticky desk:top-28 desk:self-start">
            <h2 id="payment-summary" className="border-b border-acute-ink pb-3">
              <span className="eyebrow text-acute-ink">{checkout.summary}</span>
            </h2>
            <ul className="divide-y divide-acute-line border-b border-acute-line">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-4">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-[0.625rem_0.625rem_0_0.625rem]">
                    <ProductImage src={line.image_url} alt={line.name} category={line.category} sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif leading-tight">{line.name}</p>
                    <p className="mt-1 text-xs text-acute-ink-light">
                      {categories[line.category]}
                      {line.size && ` · ${cart.size} ${line.size}`} · ×{line.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm tabular-nums">{price(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="pt-5">
              <CartTotals subtotal={subtotal} member={member} shipping={shipping} />
              <button type="submit" disabled={processing} className="btn-primary mt-6 w-full">
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                {processing ? t.processing : t.pay(price(total))}
              </button>
            </div>
          </aside>
        </form>
      )}
    </section>
  );
}
