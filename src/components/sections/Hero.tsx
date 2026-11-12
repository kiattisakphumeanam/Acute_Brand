import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Squiggle } from "@/components/ui/AcIcon";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { getHeroVideo } from "@/lib/hero-video";
import { getDictionary } from "@/lib/i18n/server";

export async function Hero() {
  const { home: { hero: t } } = await getDictionary();
  const video = getHeroVideo();

  // Full-bleed video version — used as soon as public/videos/hero.mp4 exists.
  // Height = first screen minus promo bar + header (98px mobile, 158px desktop with the nav row).
  if (video) {
    return (
      <section className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-acute-ink text-acute-cream h-[calc(100svh-98px)] desk:h-[calc(100svh-158px)]">
        <HeroVideo video={video} pauseLabel={t.pauseVideo} playLabel={t.playVideo} />
        {/* Darkens the lower left so the copy stays readable on any footage */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-acute-ink/70 via-acute-ink/20 to-transparent" />

        <div className="container-acute relative pb-14 tab:pb-20">
          <div className="rv max-w-[720px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-acute-cream/85">{t.eyebrow}</p>
            <h1 className="caps mt-5 text-[11.5vw] tab:text-[88px] desk:text-[104px]">
              {t.line1}
              <br />
              {t.line2}
            </h1>
            <p className="mt-4 font-serif text-[24px] italic leading-tight text-acute-cream/90 tab:text-[32px]">
              {t.italic}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#shop" className="btn-primary group">
                {t.primary}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#story"
                className="btn border border-acute-cream text-acute-cream hover:bg-acute-cream hover:text-acute-ink"
              >
                {t.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-acute grid items-center gap-12 pb-16 pt-10 desk:grid-cols-[1.25fr_1fr] desk:gap-12 desk:pb-24 desk:pt-16">
      {/* min-w-0: let the column shrink to the screen instead of stretching to the headline */}
      <div className="rv min-w-0">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="caps mt-6 text-[11.5vw] tab:text-[88px] desk:text-[clamp(56px,5.8vw,92px)]">
          {t.line1}
          <br />
          <span className="text-acute-red">{t.line2}</span>
        </h1>
        <p className="mt-5 font-serif text-[26px] italic leading-tight text-acute-ink-light tab:text-[34px]">
          {t.italic}
        </p>
        <p className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-acute-ink-light">{t.body}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="#shop" className="btn-primary group">
            {t.primary}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href="#story" className="btn-outline">
            {t.secondary}
          </Link>
        </div>
      </div>

      <div className="rv relative mx-auto w-full max-w-[520px]">
        <div aria-hidden className="absolute right-0 top-10 tab:-right-6 h-[78%] w-[78%] rounded-arch bg-acute-blue" />
        <EditorialPlaceholder
          tone="sand"
          label="AW26 — Column Midi Dress"
          caption="Look 01 — Column Midi Dress"
          className="relative aspect-[4/5] w-[88%] rounded-arch"
        />

        <Squiggle className="absolute -right-2 bottom-2 h-20 text-acute-red tab:-right-10" />
      </div>
    </section>
  );
}
