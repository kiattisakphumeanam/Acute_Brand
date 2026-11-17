import Link from "next/link";
import { SlidePhoto } from "@/components/sections/SlidePhoto";
import { getDictionary } from "@/lib/i18n/server";
import { getOfferPhoto } from "@/lib/site-media";

/** Hero slide — free tote member offer on ACUTE Red. */
export async function OfferBanner() {
  const { home: { offer: t } } = await getDictionary();
  // Set in /admin/media; public/slides/offer.jpg or a Moments photo until then
  const photo = await getOfferPhoto();

  return (
    <div className="relative flex h-full flex-col bg-acute-red text-acute-cream tab:block">
      <SlidePhoto src={photo}>
        {/* Drawn tote — only when there is no photo at all */}
        <svg viewBox="0 0 300 340" aria-hidden className="h-[min(15rem,30dvh)] w-auto -rotate-6 tab:h-[min(20rem,40dvh)]">
          <path d="M95 110 C95 40 205 40 205 110" fill="none" stroke="#F7F3EE" strokeWidth="12" strokeLinecap="round" />
          <rect x="40" y="100" width="220" height="230" rx="6" fill="#F7F3EE" />
          <text x="150" y="235" textAnchor="middle" fill="#AE3C31" style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 92 }}>
            ac
          </text>
          <path d="M80 280 C110 260 130 300 160 282 C190 264 210 296 228 280" fill="none" stroke="#AE3C31" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </SlidePhoto>

      <div className="container-acute relative flex pb-20 pt-6 tab:h-full tab:items-end tab:pb-[min(4.5rem,10dvh)] tab:pt-0 desk:pb-[min(4rem,8dvh)]">
        <div className="slide-copy">
          <p className="text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.24em] text-acute-blue">{t.eyebrow}</p>
          <h2 className="caps mt-4 text-[7.5vw] tab:mt-3 tab:text-[min(3rem,7dvh)] desk:text-[min(3.5rem,7dvh)]">{t.title}</h2>
          <p className="mt-4 max-w-[26rem] text-[0.9375rem] leading-relaxed text-acute-cream/85 tab:mt-3 tab:text-[1rem]">{t.body}</p>
          <Link href="/membership" className="btn-light mt-6 tab:mt-[min(1.75rem,4dvh)]">
            {t.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
