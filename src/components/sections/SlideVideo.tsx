"use client";

import { useContext, useEffect, useRef } from "react";
import { SlideActiveContext, SlideshowContext } from "@/components/sections/HeroCarousel";

/**
 * Muted looping video for a hero slide's media panel. Plays only while its slide is on screen and the
 * slideshow isn't paused — the slideshow's pause button covers it, and reduced motion starts it paused.
 */
export function SlideVideo({ src, type }: { src: string; type: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const paused = useContext(SlideshowContext)?.paused ?? false;
  const active = useContext(SlideActiveContext);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && !paused) el.play().catch(() => {});
    else el.pause();
  }, [active, paused]);

  return (
    // #t=0.1 shows the first frame while it waits instead of a blank box
    <video ref={ref} muted loop playsInline preload="metadata" aria-hidden className="absolute inset-0 h-full w-full object-cover">
      <source src={`${src}#t=0.1`} type={type} />
    </video>
  );
}
