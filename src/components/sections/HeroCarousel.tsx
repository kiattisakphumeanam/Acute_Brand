"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { useUI, type HeroTone } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Time each slide stays up before the next one slides in. */
const INTERVAL_MS = 5000;

export interface HeroSlide {
  key: string;
  /**
   * Colour of the controls over this slide — "dark" slides get cream controls, "light" ones ink.
   * "light-on-phones": ink on phones, cream from tablet up, where the controls sit on the slide's photo.
   */
  tone: HeroTone;
  /** A link to /#<hash> opens the slideshow on this slide (e.g. the mega menu's /#launch). */
  hash?: string;
  node: React.ReactNode;
}

/** Lets the hero video follow the slideshow's pause button instead of showing its own. */
export const SlideshowContext = createContext<{ paused: boolean } | null>(null);
/** Whether the slide around a component is the one on screen — videos only play while it is. */
export const SlideActiveContext = createContext(true);

/**
 * Full-screen hero slideshow. Advances every few seconds, stops while hovered or focused,
 * and never auto-advances for prefers-reduced-motion (the pause button starts pressed).
 * Pulled up under the header (which rests on it, transparent, on the home page), so promo bar + hero = one screen.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const { t: { home: { hero: t } } } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  // Bumped whenever autoplay resumes, so the timer and progress line restart together
  const [run, setRun] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const setHeroTone = useUI((s) => s.setHeroTone);

  const count = slides.length;
  const running = !paused && !holding;
  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (running) setRun((r) => r + 1);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [running, index, run, go]);

  // The slides have no DOM ids (scrolling to an off-screen slide would shift the track), so match the hash here
  useEffect(() => {
    const openFromHash = () => {
      const i = slides.findIndex((s) => s.hash && `#${s.hash}` === window.location.hash);
      if (i < 0) return;
      setIndex(i);
      sectionRef.current?.scrollIntoView({ block: "start" });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [slides]);

  const tone = slides[index].tone;
  useEffect(() => setHeroTone(tone), [tone, setHeroTone]);

  return (
    <SlideshowContext.Provider value={{ paused }}>
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-label={t.slides}
        // Mouse only — on touch screens a tap fires enter but never leave
        onPointerEnter={(e) => e.pointerType === "mouse" && setHolding(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHolding(false)}
        onFocus={() => setHolding(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHolding(false);
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") swipeFrom.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeFrom.current === null) return;
          const dx = e.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => (swipeFrom.current = null)}
        className="relative isolate -mt-[var(--header-h)] h-[calc(100dvh-var(--promo-h))] min-h-[32rem] touch-pan-y overflow-hidden bg-acute-ink tab:min-h-0"
      >
        <div
          className="flex h-full transition-transform duration-700 ease-soft motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={t.slide(i + 1, count)}
              aria-hidden={i !== index}
              inert={i !== index}
              className="h-full w-full shrink-0"
            >
              <SlideActiveContext.Provider value={i === index}>{slide.node}</SlideActiveContext.Provider>
            </div>
          ))}
        </div>

        {/* Sits on the same line as the slide's buttons from tablet up; below the copy on phones */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div
            className={cn(
              "container-acute flex items-center justify-end pb-4 transition-colors duration-500 tab:pb-[min(4.5rem,10dvh)] desk:pb-[min(4rem,8dvh)]",
              tone === "dark" && "text-acute-cream",
              tone === "light" && "text-acute-ink",
              tone === "light-on-phones" && "text-acute-ink tab:text-acute-cream",
            )}
          >
            <div className="pointer-events-auto -mr-2 flex items-center">
              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? t.playSlides : t.pauseSlides}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:text-acute-red"
              >
                {paused ? <Play className="h-4 w-4" strokeWidth={1.5} /> : <Pause className="h-4 w-4" strokeWidth={1.5} />}
              </button>

              <ol className="mx-1 flex">
                {slides.map((slide, i) => (
                  <li key={slide.key}>
                    <button
                      onClick={() => go(i)}
                      aria-label={t.goToSlide(i + 1)}
                      aria-current={i === index}
                      className="group relative block h-10 w-9 tab:w-11"
                    >
                      <span className="absolute inset-x-1 top-1/2 h-px bg-current opacity-35 transition-opacity group-hover:opacity-70" />
                      {/* Fills while this slide is up — shows how long until the next one */}
                      {i === index && (
                        <span
                          key={run}
                          className="absolute inset-x-1 top-1/2 h-px origin-left bg-current"
                          style={
                            paused
                              ? undefined
                              : {
                                  animation: `hero-progress ${INTERVAL_MS}ms linear both`,
                                  animationPlayState: running ? "running" : "paused",
                                }
                          }
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => go(index - 1)}
                aria-label={t.prevSlide}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:text-acute-red"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.4} />
              </button>
              <button
                onClick={() => go(index + 1)}
                aria-label={t.nextSlide}
                className="flex h-10 w-10 items-center justify-center transition-colors hover:text-acute-red"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </SlideshowContext.Provider>
  );
}
