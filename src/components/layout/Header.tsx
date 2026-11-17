"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useUser } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { Wordmark } from "@/components/ui/Wordmark";
import { MENU, SOCIALS } from "@/data/storefront";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const iconClass = "h-[1.1875rem] w-[1.1875rem]";
const actionClass =
  "on-hero relative flex h-10 w-10 items-center justify-center text-acute-ink transition-colors duration-300 ease-soft hover:text-acute-red";

export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    // Re-keying on count replays the pop whenever an item is added or removed
    <span
      key={count}
      className="absolute right-0.5 top-0.5 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-acute-red px-1 text-[length:max(0.5625rem,9px)] font-semibold text-acute-cream"
    >
      {count}
    </span>
  );
}

/** `menuImages`: mega menu photos uploaded in /admin/media, by group label (see getMenuImages). */
export function Header({ menuImages }: { menuImages: Record<string, string> }) {
  const user = useUser();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { count, open } = useCart();
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const heroTone = useUI((s) => s.heroTone);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setActive(null);
  }, [pathname]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // A short delay lets the pointer travel from the nav row into the panel
  const openGroup = (i: number) => {
    clearTimeout(closeTimer.current);
    setActive(i);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 120);
  };

  // Pages that open on a full-bleed hero (home, membership): rest transparent on it until hovered, keyboard-focused,
  // a menu is open, or the page scrolls. White on dark slides; on light ones it keeps its own colours.
  const resting = !scrolled && !hovered && !focused && !menuOpen && active === null;
  const over = !resting
    ? undefined
    : pathname === "/membership"
      ? "dark"
      : pathname === "/"
        ? heroTone === "dark"
          ? "dark"
          : "light"
        : undefined;

  const cartIcon = (
    <>
      <ShoppingBag className={iconClass} strokeWidth={1.4} />
      <CountBadge count={count} />
    </>
  );

  return (
    <>
      <header
        data-over={over}
        // Mouse only — on touch screens a tap fires enter but never leave
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHovered(false);
          scheduleClose();
        }}
        // Keyboard focus only — a tap also focuses the button, which would leave the header solid after the menu closes
        onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
        className={cn(
          "site-header sticky top-0 z-40 border-b bg-acute-cream/95 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ease-soft",
          scrolled ? "border-acute-line shadow-[0_1px_24px_-12px_rgba(47,49,53,0.18)]" : "border-transparent",
        )}
      >
        <div className="container-acute relative grid h-[4rem] grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: menu toggle on mobile, socials on desktop */}
          <div className="flex items-center">
            <button
              className="on-hero -ml-2 flex h-10 w-10 items-center justify-center transition-colors duration-300 tab:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              <Menu className={iconClass} strokeWidth={1.4} />
            </button>
            <ul aria-label={t.header.socials} className="hidden items-center gap-2 tab:flex">
              {SOCIALS.map((s, i) => (
                <li key={s.label} className="social-in" style={{ animationDelay: `${200 + i * 90}ms` }}>
                  <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="social">
                    <SocialIcon name={s.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/"
            aria-label={t.nav.home}
            className="on-hero text-acute-red transition-colors duration-300 hover:text-acute-red-dark"
          >
            <Wordmark title="" className="h-[1.375rem] desk:h-[1.5rem]" />
          </Link>

          <div className="-mr-2 flex items-center justify-end">
            <button onClick={() => setSearchOpen(true)} className={actionClass} aria-label={t.search.open}>
              <Search className={iconClass} strokeWidth={1.4} />
            </button>
            <Link
              href={user ? "/account" : "/login"}
              className={actionClass}
              aria-label={user ? t.nav.account : t.nav.signIn}
            >
              <User className={iconClass} strokeWidth={1.4} />
            </Link>
            {user ? (
              <button onClick={open} className={actionClass} aria-label={t.nav.openCart(count)}>
                {cartIcon}
              </button>
            ) : (
              <Link href="/login" className={actionClass} aria-label={t.nav.signInForCart}>
                {cartIcon}
              </Link>
            )}
            <span aria-hidden className="on-hero-line mx-2 hidden h-4 w-px bg-acute-stone/60 transition-colors duration-300 tab:block" />
            <LanguageSwitcher className="hidden tab:flex" itemClassName="on-hero" />
          </div>
        </div>

        {/* Desktop nav row */}
        <nav aria-label="Main" className="on-hero-rule hidden border-t border-acute-line transition-colors duration-300 tab:block">
          <ul className="flex items-center justify-center gap-7 desk:gap-9">
            {MENU.map((group, i) => (
              <li key={group.label}>
                <Link
                  href={group.href}
                  onMouseEnter={() => openGroup(i)}
                  onFocus={() => openGroup(i)}
                  aria-expanded={active === i}
                  aria-haspopup="true"
                  className={cn(
                    "on-hero relative block py-[0.875rem] text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 hover:text-acute-red",
                    active === i && "text-acute-red",
                  )}
                >
                  {group.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-[0.5rem] h-px origin-left bg-acute-red transition-transform duration-500 ease-soft",
                      active === i ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            ))}
            {user?.role === "admin" && (
              <li>
                <Link
                  href="/admin"
                  className="on-hero block py-[0.875rem] text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-red"
                >
                  {t.nav.admin}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <MegaMenu
          images={menuImages}
          active={active}
          onEnter={() => clearTimeout(closeTimer.current)}
          onLeave={scheduleClose}
          onNavigate={() => setActive(null)}
        />
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
