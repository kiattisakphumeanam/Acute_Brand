"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { SlideActiveContext, SlideshowContext } from "@/components/sections/HeroCarousel";
import type { HeroVideoFiles } from "@/lib/hero-video";

interface Props {
  video: HeroVideoFiles;
  pauseLabel: string;
  playLabel: string;
}

/**
 * Muted looping background video. Starts paused for prefers-reduced-motion; always has a pause button —
 * its own, or inside the hero slideshow, the slideshow's one.
 */
export function HeroVideo({ video, pauseLabel, playLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const slideshow = useContext(SlideshowContext);
  const slideshowPaused = slideshow?.paused;
  const active = useContext(SlideActiveContext);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      setPlaying(false);
      return;
    }
    // Some browsers block autoplay (e.g. low-power mode) — reflect that in the button
    el.play().catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || slideshowPaused === undefined) return;
    // Also rests while another slide is on screen
    if (slideshowPaused || !active) el.pause();
    else el.play().catch(() => {});
  }, [slideshowPaused, active]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={video.poster}
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      >
        {video.mobile && <source src={video.mobile.src} type={video.mobile.type} media="(max-width: 759px)" />}
        <source src={video.src} type={video.type} />
      </video>
      {!slideshow && (
        <button
          onClick={toggle}
          aria-label={playing ? pauseLabel : playLabel}
          className="hex absolute bottom-5 right-5 z-10 flex h-11 w-12 items-center justify-center bg-acute-cream/85 text-acute-ink transition-colors hover:bg-acute-red hover:text-acute-cream tab:bottom-8 tab:right-8"
        >
          {playing ? <Pause className="h-4 w-4" strokeWidth={1.5} /> : <Play className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      )}
    </>
  );
}
