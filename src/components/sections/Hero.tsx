import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Squiggle } from "@/components/ui/AcIcon";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { LaunchCountdown } from "@/components/sections/LaunchCountdown";
import { OfferBanner } from "@/components/sections/OfferBanner";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { LAUNCH_AT } from "@/data/storefront";
import type { HeroVideoFiles } from "@/lib/hero-video";
import { getDictionary } from "@/lib/i18n/server";
import { getHeroMedia, getLaunchMedia } from "@/lib/site-media";

/** First screen: the campaign hero, then the member offer and the next launch, as one slideshow. */
export async function Hero() {
  // Set in /admin/media; files in public/ stand in until something is uploaded (src/lib/site-media.ts)
  const [video, launch] = await Promise.all([getHeroMedia(), getLaunchMedia()]);

  return (
    <HeroCarousel
      slides={[
        { key: "campaign", tone: video ? "dark" : "light", node: video ? <VideoSlide video={video} /> : <StillSlide /> },
        { key: "offer", tone: "dark", node: <OfferBanner /> },
        {
          key: "launch",
          // Full-bleed video reads like the first slide; the photo version is light blue
          tone: launch.video ? "dark" : launch.photo ? "light-on-phones" : "light",
          hash: "launch",
          node: <LaunchCountdown launchAt={LAUNCH_AT} photo={launch.photo} video={launch.video} />,
        },
      ]}
    />
  );
}

// Full-bleed video version — used as soon as there is a hero video (uploaded, or public/videos/hero.mp4).
// Below tablet the copy sits higher to leave room for the slideshow controls under it.
async function VideoSlide({ video }: { video: HeroVideoFiles }) {
  const { home: { hero: t } } = await getDictionary();

  return (
    <div className="relative isolate flex h-full items-end overflow-hidden text-acute-cream">
      <HeroVideo video={video} pauseLabel={t.pauseVideo} playLabel={t.playVideo} />
      {/* Darkens the lower left so the copy stays readable on any footage, and the top for the white header */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-acute-ink/70 via-acute-ink/20 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[calc(var(--header-h)+3rem)] bg-gradient-to-b from-acute-ink/35 to-transparent" />

      <div className="container-acute relative pb-20 tab:pb-[min(4.5rem,10dvh)] desk:pb-[min(4rem,8dvh)]">
        <div className="max-w-[60rem]">
          <p className="text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.24em] text-acute-cream/85">{t.eyebrow}</p>
          <h1 className="caps mt-4 text-[7.5vw] tab:mt-3 tab:text-[min(3rem,7dvh)] desk:text-[min(3.5rem,7dvh)]">
            {t.line1}
            <br />
            {t.line2}
          </h1>
          <p className="mt-3 font-serif text-[1.5rem] italic leading-tight text-acute-cream/90 tab:mt-2 tab:text-[min(1.625rem,4dvh)]">
            {t.italic}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 tab:mt-[min(1.75rem,4dvh)]">
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
    </div>
  );
}

async function StillSlide() {
  const { home: { hero: t } } = await getDictionary();

  return (
    <div className="h-full overflow-hidden bg-acute-cream">
      <div className="container-acute grid h-full items-center gap-12 pb-16 pt-[calc(var(--header-h)+1rem)] desk:grid-cols-[1.25fr_1fr] desk:gap-12">
        {/* min-w-0: let the column shrink to the screen instead of stretching to the headline */}
        <div className="min-w-0">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="caps mt-6 text-[11.5vw] tab:text-[5.5rem] desk:text-[clamp(2.75rem,4.2vw,4.5rem)]">
            {t.line1}
            <br />
            <span className="text-acute-red">{t.line2}</span>
          </h1>
          <p className="mt-5 font-serif text-[1.625rem] italic leading-tight text-acute-ink-light tab:text-[2.125rem]">
            {t.italic}
          </p>
          <p className="mt-6 max-w-[27.5rem] text-[1rem] leading-relaxed text-acute-ink-light">{t.body}</p>
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

        <div className="relative mx-auto hidden w-full max-w-[26rem] desk:block">
          <div aria-hidden className="absolute right-0 top-10 h-[78%] w-[78%] rounded-arch bg-acute-blue" />
          <EditorialPlaceholder
            tone="sand"
            label="AW26 Column Midi Dress"
            caption="Look 01, Column Midi Dress"
            className="relative aspect-[4/5] w-[88%] rounded-arch"
          />

          <Squiggle className="absolute -right-2 bottom-2 h-20 text-acute-red" />
        </div>
      </div>
    </div>
  );
}
