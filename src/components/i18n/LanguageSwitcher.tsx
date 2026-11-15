"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

/** `itemClassName` goes on the letters and the slash, e.g. for the header to recolour them over the hero. */
export function LanguageSwitcher({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const { locale, t, setLocale } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={cn("flex items-center text-[length:max(0.6875rem,10px)] font-medium uppercase tracking-[0.2em]", className)}
    >
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className={cn("px-1.5 text-acute-stone transition-colors duration-300", itemClassName)}>/</span>}
          <button
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            lang={l}
            className={cn(
              "p-1 transition-colors hover:text-acute-red",
              locale === l ? "text-acute-red" : "text-acute-ink/50",
              itemClassName,
            )}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
