"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { MENU } from "@/data/storefront";
import { cn } from "@/lib/utils";

interface Props {
  active: number | null;
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}

/** Full-width dropdown under the desktop nav: link columns on the left, a full-bleed featured photo on the right. */
export function MegaMenu({ active, onEnter, onLeave, onNavigate }: Props) {
  const { t } = useTranslation();

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "absolute inset-x-0 top-full hidden border-b border-acute-line bg-acute-cream transition-[opacity,transform] duration-300 ease-soft tab:block",
        active === null ? "pointer-events-none -translate-y-2 opacity-0" : "translate-y-0 opacity-100",
      )}
      inert={active === null}
    >
      {MENU.map((group, i) => active === i && (
        <div key={group.label} className="grid desk:grid-cols-[45fr_55fr]">
          {/* Left edge lines up with the header's container (max 85rem, 3rem gutter) */}
          <div className="flex gap-16 px-8 py-10 desk:gap-20 desk:border-r desk:border-acute-line desk:py-12 desk:pl-[max(3rem,calc((100vw-85rem)/2+3rem))] desk:pr-12">
            {group.columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="font-serif text-[1.375rem] leading-tight decoration-1 underline-offset-[0.3em] transition-colors hover:text-acute-red hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href={group.feature.href}
            onClick={onNavigate}
            className="group relative hidden min-h-[22rem] overflow-hidden desk:block"
          >
            {/* Wider than the panel: the square lookbook photos carry white side margins (~11%) that would show here */}
            <div className="absolute inset-y-0 -inset-x-[16%] transition-transform duration-700 ease-soft group-hover:scale-[1.03]">
              <Image src={group.feature.image} alt="" fill sizes="75vw" className="object-cover object-[50%_15%]" />
            </div>
            {/* Darkens the lower edge just enough for white type on light photos */}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-acute-ink/65 via-acute-ink/15 to-transparent" />
            <div className="absolute inset-x-10 bottom-10 text-acute-cream">
              <p className="caps text-[2rem] leading-none">{group.feature.title}</p>
              <span className="mt-5 inline-flex rounded-full border border-acute-cream/80 px-6 py-[0.625rem] text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 group-hover:bg-acute-cream group-hover:text-acute-ink">
                {t.header.shopNow}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
