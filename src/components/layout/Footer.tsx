import Link from "next/link";
import { CurrencySelect, NewsletterForm } from "@/components/layout/FooterControls";
import { AcIcon } from "@/components/ui/AcIcon";
import { Wordmark } from "@/components/ui/Wordmark";
import { SOCIALS } from "@/data/storefront";
import { getDictionary } from "@/lib/i18n/server";

export async function Footer() {
  const { footer: t } = await getDictionary();

  const columns = [
    {
      title: t.shopCol,
      links: [
        { label: t.newIn, href: "/#shop" },
        { label: t.allItems, href: "/#shop" },
        { label: "Moments", href: "/#moments" },
      ],
    },
    {
      title: t.companyCol,
      links: [
        { label: t.about, href: "/about" },
        { label: t.stores, href: "/#stores" },
        { label: t.membership, href: "/signup" },
      ],
    },
    {
      title: t.serviceCol,
      links: [
        { label: t.shipping, href: "/about" },
        { label: t.sizeGuide, href: "/about" },
        { label: t.contact, href: "mailto:hello@acute.studio" },
        { label: t.faq, href: "/about" },
      ],
    },
    {
      title: t.legalCol,
      links: [
        { label: t.privacy, href: "/about" },
        { label: t.terms, href: "/about" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-acute-ink text-acute-cream">
      <AcIcon className="pointer-events-none absolute -right-16 -top-10 h-[420px] text-acute-cream/[0.04]" />

      <div className="container-acute relative grid gap-14 pb-12 pt-20 desk:grid-cols-[1.1fr_1.6fr] desk:gap-20">
        <div>
          <Wordmark className="h-8 text-acute-cream" />
          <p className="mt-8 caps text-[34px]">{t.newsletterTitle}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-acute-cream/60">{t.newsletterBody}</p>
          <NewsletterForm />
          <ul className="mt-8 flex gap-1.5">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="hex flex h-9 min-w-10 items-center justify-center bg-acute-cream/10 px-2 text-[9px] font-semibold tracking-[0.1em] transition-colors hover:bg-acute-red"
                >
                  {s.short}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-10 tab:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-acute-red-light">{col.title}</p>
              <ul className="mt-5 space-y-3 text-[14px] text-acute-cream/75">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-acute-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-acute relative flex flex-col gap-5 border-t border-acute-cream/10 py-7 tab:flex-row tab:items-center tab:justify-between">
        <CurrencySelect />
        <div className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-acute-cream/45 tab:items-end">
          <span>© {new Date().getFullYear()} ACUTE · {t.company}</span>
          <span className="font-serif text-sm normal-case italic tracking-normal">{t.motto}</span>
        </div>
      </div>
    </footer>
  );
}
