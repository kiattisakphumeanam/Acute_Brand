"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { MENU } from "@/data/storefront";
import { cn } from "@/lib/utils";

interface Props {
  active: number | null;
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}

/** Full-width dropdown under the desktop nav: link columns on the left, a featured arch image on the right. */
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
        <div key={group.label} className="container-acute grid gap-16 py-12 desk:grid-cols-[1fr_27.5rem]">
          <div className="flex gap-20">
            {group.columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="font-serif text-[1.375rem] leading-tight transition-colors hover:text-acute-red"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link href={group.feature.href} onClick={onNavigate} className="group hidden items-end gap-6 desk:flex">
            <EditorialPlaceholder
              tone={group.feature.tone}
              label={group.feature.title}
              className="h-[12rem] w-[8.5rem] shrink-0 rounded-arch"
            />
            <div className="pb-2">
              <p className="caps text-[1.625rem]">{group.feature.title}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-red">
                {t.header.shopNow}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
