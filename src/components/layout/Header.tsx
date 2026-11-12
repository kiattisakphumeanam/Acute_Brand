"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useUser } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { Wordmark } from "@/components/ui/Wordmark";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { MENU, SOCIALS } from "@/data/storefront";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const iconClass = "h-[19px] w-[19px]";
const actionClass =
  "relative flex h-10 w-10 items-center justify-center text-acute-ink transition-colors duration-300 ease-soft hover:text-acute-red";

export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    // Re-keying on count replays the pop whenever an item is added or removed
    <span
      key={count}
      className="absolute right-0.5 top-0.5 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-acute-red px-1 text-[9px] font-semibold text-acute-cream"
    >
      {count}
    </span>
  );
}

export function Header() {
  const user = useUser();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { count, open } = useCart();
  const { count: savedCount } = useWishlist();
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  const cartIcon = (
    <>
      <ShoppingBag className={iconClass} strokeWidth={1.4} />
      <CountBadge count={count} />
    </>
  );

  return (
    <>
      <header
        onMouseLeave={scheduleClose}
        className={cn(
          "sticky top-0 z-40 border-b bg-acute-cream/95 backdrop-blur-md transition-[border-color,box-shadow] duration-500 ease-soft",
          scrolled ? "border-acute-line shadow-[0_1px_24px_-12px_rgba(47,49,53,0.18)]" : "border-transparent",
        )}
      >
        <div className="container-acute relative grid h-[64px] grid-cols-[1fr_auto_1fr] items-center desk:h-[78px]">
          {/* Left: menu toggle on mobile, socials on desktop */}
          <div className="flex items-center">
            <button
              className="-ml-2 flex h-10 w-10 items-center justify-center desk:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              <Menu className={iconClass} strokeWidth={1.4} />
            </button>
            <ul aria-label={t.header.socials} className="hidden items-center gap-1 desk:flex">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="hex flex h-8 min-w-8 items-center justify-center bg-acute-blue px-2 text-[9px] font-semibold tracking-[0.1em] transition-colors hover:bg-acute-red hover:text-acute-cream"
                  >
                    {s.short}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/"
            aria-label={t.nav.home}
            className="text-acute-red transition-colors duration-300 hover:text-acute-red-dark"
          >
            <Wordmark title="" className="h-[22px] desk:h-[30px]" />
          </Link>

          <div className="-mr-2 flex items-center justify-end">
            <button onClick={() => setSearchOpen(true)} className={actionClass} aria-label={t.search.open}>
              <Search className={iconClass} strokeWidth={1.4} />
            </button>
            <Link
              href={user ? "/account" : "/login"}
              className={cn(actionClass, "hidden tab:flex")}
              aria-label={user ? t.nav.account : t.nav.signIn}
            >
              <User className={iconClass} strokeWidth={1.4} />
            </Link>
            <Link href="/wishlist" className={cn(actionClass, "hidden tab:flex")} aria-label={t.nav.wishlist}>
              <Heart className={iconClass} strokeWidth={1.4} />
              <CountBadge count={savedCount} />
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
            <span aria-hidden className="mx-2 hidden h-4 w-px bg-acute-stone/60 desk:block" />
            <LanguageSwitcher className="hidden desk:flex" />
          </div>
        </div>

        {/* Desktop nav row */}
        <nav aria-label="Main" className="hidden border-t border-acute-line desk:block">
          <ul className="flex items-center justify-center gap-11">
            {MENU.map((group, i) => (
              <li key={group.label}>
                <Link
                  href={group.href}
                  onMouseEnter={() => openGroup(i)}
                  onFocus={() => openGroup(i)}
                  aria-expanded={active === i}
                  aria-haspopup="true"
                  className={cn(
                    "relative block py-[14px] text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 hover:text-acute-red",
                    active === i && "text-acute-red",
                  )}
                >
                  {group.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-[8px] h-px origin-left bg-acute-red transition-transform duration-500 ease-soft",
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
                  className="block py-[14px] text-[12px] font-semibold uppercase tracking-[0.2em] text-acute-red"
                >
                  {t.nav.admin}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <MegaMenu
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
