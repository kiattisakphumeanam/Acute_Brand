"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { CURRENCIES, isCurrency, type Currency } from "@/data/storefront";
import { useUI } from "@/lib/ui-store";

export function NewsletterForm() {
  const { t: { footer: t } } = useTranslation();
  const [state, action, pending] = useActionState(subscribeNewsletter, undefined);

  if (state?.ok) {
    return <p className="mt-6 font-serif text-xl italic text-acute-blue">{t.subscribed}</p>;
  }

  return (
    <form action={action} className="mt-6">
      <div className="flex rounded-full border border-acute-cream/25 bg-acute-cream/5 p-1.5 focus-within:border-acute-cream/60">
        <input
          type="email"
          name="email"
          required
          placeholder={t.email}
          aria-label={t.email}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-acute-cream outline-none placeholder:text-acute-cream/40"
        />
        <button type="submit" disabled={pending} className="btn-primary px-5 py-3" aria-label={t.subscribe}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="hidden tab:inline">{t.subscribe}</span>}
          {!pending && <ArrowRight className="h-4 w-4 tab:hidden" />}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-acute-red-light">
          {t.invalidEmail}
        </p>
      )}
    </form>
  );
}

export function CurrencySelect() {
  const { t: { footer: t } } = useTranslation();
  const currency = useUI((s) => s.currency);
  const setCurrency = useUI((s) => s.setCurrency);

  return (
    <label className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-acute-cream/60">
      {t.currency}
      <select
        value={currency}
        onChange={(e) => isCurrency(e.target.value) && setCurrency(e.target.value)}
        className="rounded-full border border-acute-cream/25 bg-acute-ink px-4 py-2 text-acute-cream outline-none"
      >
        {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
          <option key={c} value={c}>
            {c} {CURRENCIES[c].symbol}
          </option>
        ))}
      </select>
    </label>
  );
}
