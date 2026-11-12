"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, Plus, User, X } from "lucide-react";
import { useUser } from "@/components/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { Wordmark } from "@/components/ui/Wordmark";
import { MENU, SOCIALS } from "@/data/storefront";
import { cn } from "@/lib/utils";

/** Slide-in drawer for < 1040px. Each menu group is a native <details> accordion. */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useUser();
  const { t } = useTranslation();

  // Lock page scroll behind the drawer and let Escape close it
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[60] desk:hidden", !open && "pointer-events-none")} inert={!open}>
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-acute-ink/40 transition-opacity duration-500 ease-soft",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={t.header.menu}
        className={cn(
          "absolute left-0 top-0 flex h-full w-[86%] max-w-[380px] flex-col overflow-y-auto bg-acute-cream transition-transform duration-500 ease-soft",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-acute-line px-5 py-4">
          <Wordmark className="h-5 text-acute-red" />
          <button
            onClick={onClose}
            aria-label={t.nav.closeMenu}
            className="hex flex h-10 w-10 items-center justify-center bg-acute-blue"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="px-5">
          {MENU.map((group) => (
            <details key={group.label} className="group border-b border-acute-line">
              <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                <span className="caps text-[26px]">{group.label}</span>
                <Plus className="h-4 w-4 text-acute-red transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <div className="space-y-5 pb-6">
                {group.columns.map((col) => (
                  <div key={col.title}>
                    <p className="eyebrow">{col.title}</p>
                    <ul className="mt-3 space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link href={link.href} onClick={onClose} className="text-[15px] hover:text-acute-red">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" onClick={onClose} className="caps block border-b border-acute-line py-5 text-[26px] text-acute-red">
              {t.nav.admin}
            </Link>
          )}
        </nav>

        <div className="mt-auto space-y-6 px-5 pb-8 pt-10">
          <div className="flex items-center gap-8 text-[12px] font-semibold uppercase tracking-[0.2em]">
            <Link href="/wishlist" onClick={onClose} className="flex items-center gap-2 hover:text-acute-red">
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.4} />
              {t.nav.wishlist}
            </Link>
            <Link href={user ? "/account" : "/login"} onClick={onClose} className="flex items-center gap-2 hover:text-acute-red">
              <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
              {user ? t.nav.account : t.nav.signIn}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <ul className="flex gap-1">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="hex flex h-8 min-w-8 items-center justify-center bg-acute-blue px-2 text-[9px] font-semibold"
                  >
                    {s.short}
                  </a>
                </li>
              ))}
            </ul>
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </div>
  );
}
