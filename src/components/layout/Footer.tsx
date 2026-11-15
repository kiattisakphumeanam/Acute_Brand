import Link from "next/link";
import { CurrencySelect, NewsletterForm } from "@/components/layout/FooterControls";
import { AcIcon } from "@/components/ui/AcIcon";
import { SocialIcon } from "@/components/ui/SocialIcon";
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
        { label: t.allItems, href: "/products" },
        { label: "Moments", href: "/#moments" },
      ],
    },
    {
      title: t.companyCol,
      links: [
        { label: t.about, href: "/about" },
        { label: t.membership, href: "/membership" },
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
      <AcIcon className="pointer-events-none absolute -right-16 -top-10 h-[20rem] text-acute-cream/[0.04]" />

      <div className="container-acute relative grid gap-12 pb-12 pt-16 desk:grid-cols-[1.1fr_1.6fr] desk:gap-16">
        <div>
          <Wordmark className="h-8 text-acute-cream" />
          <p className="mt-8 caps text-[2.125rem]">{t.newsletterTitle}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-acute-cream/60">{t.newsletterBody}</p>
          <NewsletterForm />
          <ul className="mt-8 flex gap-2.5">
            {SOCIALS.map((s, i) => (
              // Staggered scroll reveal via RevealObserver
              <li key={s.label} className="rv" style={{ transitionDelay: `${i * 110}ms` }}>
                <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="social">
                  <SocialIcon name={s.label} className="h-9 w-9" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-10 tab:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.24em] text-acute-red-light">{col.title}</p>
              <ul className="mt-5 space-y-3 text-[0.875rem] text-acute-cream/75">
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
        <div className="flex flex-col gap-1 text-[length:max(0.6875rem,10px)] uppercase tracking-[0.2em] text-acute-cream/45 tab:items-end">
          <span>© {new Date().getFullYear()} ACUTE · {t.company}</span>
          <span className="font-serif text-sm normal-case italic tracking-normal">{t.motto}</span>
        </div>
      </div>
    </footer>
  );
}
