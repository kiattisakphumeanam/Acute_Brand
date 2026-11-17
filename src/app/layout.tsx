import type { Metadata } from "next";
import { cookies } from "next/headers";
import { EB_Garamond, Josefin_Sans, Noto_Sans_Thai } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PromoMarquee } from "@/components/layout/PromoMarquee";
import { MemberModal } from "@/components/overlays/MemberModal";
import { QuickViewModal } from "@/components/overlays/QuickViewModal";
import { SearchOverlay } from "@/components/overlays/SearchOverlay";
import { Toast } from "@/components/overlays/Toast";
import { PhilosophyMarquee } from "@/components/sections/PhilosophyMarquee";
import { CurrencyInit } from "@/components/ui/CurrencyInit";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { CURRENCY_COOKIE, isCurrency } from "@/data/storefront";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { getProducts } from "@/lib/products";
import { getMenuImages } from "@/lib/site-media";
import "./globals.css";

// Headings — web stand-in for the brand's Minion display face
const serif = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

// Body & subheadings — the brand's secondary typeface
const sans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-sans",
});

// Neither Latin face has Thai glyphs — both font stacks fall back to this.
const thai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "600"],
  variable: "--font-thai",
});

export const metadata: Metadata = {
  title: "ACUTE | Intentional in-between",
  description:
    "Minimalist womenswear for the intentional in-between. Clear, confident, intentional pieces made for everyday self-expression.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, locale, products, cookieStore, menuImages] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getProducts(),
    cookies(),
    getMenuImages(),
  ]);
  const savedCurrency = cookieStore.get(CURRENCY_COOKIE)?.value;

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable} ${thai.variable}`}>
      <body>
        <CurrencyInit currency={isCurrency(savedCurrency) ? savedCurrency : "THB"} />
        <LanguageProvider initialLocale={locale}>
          <AuthProvider user={user}>
            <CartProvider>
              <PromoMarquee />
              <Header menuImages={menuImages} />
              <main>{children}</main>
              <Footer />
              <PhilosophyMarquee />
              <CartDrawer />
              <QuickViewModal />
              <SearchOverlay products={products} />
              <MemberModal />
              <Toast />
              <RevealObserver />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
