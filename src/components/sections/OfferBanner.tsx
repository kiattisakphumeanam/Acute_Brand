import Link from "next/link";
import { AcIcon } from "@/components/ui/AcIcon";
import { getDictionary } from "@/lib/i18n/server";

/** Free tote promotion on Primary Red, with a drawn tote standing in for the product shot. */
export async function OfferBanner() {
  const { home: { offer: t } } = await getDictionary();

  return (
    <section className="container-acute py-20 desk:py-28">
      <div className="rv relative grid items-center gap-10 overflow-hidden rounded-card bg-acute-red p-8 text-acute-cream tab:p-14 desk:grid-cols-[1.2fr_1fr] desk:p-20">
        <AcIcon className="pointer-events-none absolute -bottom-10 -left-6 h-56 text-acute-red-light/30" />
        <div className="relative">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-acute-blue">{t.eyebrow}</p>
          <h2 className="caps mt-4 text-[46px] tab:text-[68px]">{t.title}</h2>
          <p className="mt-5 max-w-[420px] text-[16px] leading-relaxed text-acute-cream/85">{t.body}</p>
          <Link href="/signup" className="btn-light mt-9">
            {t.cta}
          </Link>
        </div>

        {/* Tote */}
        <div aria-hidden className="relative mx-auto w-full max-w-[300px]">
          <svg viewBox="0 0 300 340" className="w-full -rotate-6">
            <path d="M95 110 C95 40 205 40 205 110" fill="none" stroke="#F7F3EE" strokeWidth="12" strokeLinecap="round" />
            <rect x="40" y="100" width="220" height="230" rx="6" fill="#F7F3EE" />
            <text x="150" y="235" textAnchor="middle" fill="#AE3C31" style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 92 }}>
              ac
            </text>
            <path d="M80 280 C110 260 130 300 160 282 C190 264 210 296 228 280" fill="none" stroke="#AE3C31" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
