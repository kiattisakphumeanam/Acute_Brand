"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { SlidePhoto } from "@/components/sections/SlidePhoto";
import { SlideVideo } from "@/components/sections/SlideVideo";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/ui-store";

function remaining(target: number) {
  const ms = Math.max(target - Date.now(), 0);
  return [
    Math.floor(ms / 86_400_000),
    Math.floor(ms / 3_600_000) % 24,
    Math.floor(ms / 60_000) % 60,
    Math.floor(ms / 1000) % 60,
  ];
}

/**
 * Hero slide — countdown to the next collection drop, in hexagon cells.
 * With a video it fills the slide like the first one (cream copy on the footage); otherwise light blue beside a photo.
 */
export function LaunchCountdown({
  launchAt,
  photo,
  video,
}: {
  launchAt: string;
  photo?: string;
  video?: { src: string; type: string };
}) {
  const { t: { home: { launch: t }, quick } } = useTranslation();
  const showToast = useUI((s) => s.showToast);
  const target = new Date(launchAt).getTime();
  // null until mounted, so the server and first client render agree
  const [parts, setParts] = useState<number[] | null>(null);

  useEffect(() => {
    setParts(remaining(target));
    const timer = setInterval(() => setParts(remaining(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const live = parts !== null && parts.every((n) => n === 0);

  return (
    <div
      className={cn(
        "relative isolate flex h-full overflow-hidden",
        video ? "items-end text-acute-cream" : "flex-col bg-acute-blue text-acute-ink tab:block",
      )}
    >
      {video ? (
        <>
          <SlideVideo src={video.src} type={video.type} />
          {/* Heavier than the first slide's: this footage has a large logo mid-frame, right behind the copy.
              Phones darken from the bottom; from tablet up, from the left where the copy sits. Plus the header scrim. */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-acute-ink/85 via-acute-ink/55 to-acute-ink/10 tab:bg-gradient-to-r tab:from-acute-ink/80 tab:via-acute-ink/45 tab:to-transparent" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-[calc(var(--header-h)+3rem)] bg-gradient-to-b from-acute-ink/35 to-transparent" />
        </>
      ) : (
        <SlidePhoto src={photo} />
      )}

      <div
        className={cn(
          "container-acute relative flex pb-20 tab:items-end tab:pb-[min(4.5rem,10dvh)] desk:pb-[min(4rem,8dvh)]",
          !video && "pt-6 tab:h-full tab:pt-0",
        )}
      >
        <div className={video ? "max-w-[60rem]" : "slide-copy"}>
          <p className={video ? "text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.24em] text-acute-cream/85" : "eyebrow"}>
            {t.eyebrow}
          </p>
          <h2 className="caps mt-4 text-[7.5vw] tab:mt-3 tab:text-[min(3rem,7dvh)] desk:text-[min(3.5rem,7dvh)]">{t.title}</h2>
          <p
            className={cn(
              "mt-3 max-w-[28.75rem] text-[0.9375rem] leading-relaxed tab:text-[1rem]",
              video ? "text-acute-cream/85" : "text-acute-ink-light",
            )}
          >
            {t.body}
          </p>

          {/* Four equal columns that share the row, so the cells can't clip or crowd; outline only, no fill */}
          <ol
            className="mt-5 grid w-full max-w-[max(320px,24rem)] grid-cols-4 gap-2 tab:mt-[min(1.5rem,3.5dvh)] tab:gap-3"
            aria-label={t.title}
          >
            {t.units.map((unit, i) => (
              <li
                key={unit}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center rounded-[0.375rem] border py-3 text-center tab:py-[max(10px,min(1rem,2dvh))]",
                  video ? "border-acute-cream/35 bg-acute-ink/15 text-acute-cream" : "border-acute-ink/20 text-acute-ink",
                )}
              >
                <span className="font-serif text-[1.75rem] leading-none tabular-nums tab:text-[max(24px,min(2.375rem,5dvh))]">
                  {parts ? String(parts[i]).padStart(2, "0") : "--"}
                </span>
                {/* pl matches the tracking, so the letter-spaced label sits optically centred */}
                <span
                  className={cn(
                    "mt-1.5 pl-[0.2em] text-[length:max(0.5625rem,9px)] font-semibold uppercase tracking-[0.2em] tab:text-[length:max(0.625rem,10px)]",
                    video ? "text-acute-cream/75" : "text-acute-red",
                  )}
                >
                  {unit}
                </span>
              </li>
            ))}
          </ol>

          {live ? (
            <a href="#shop" className="btn-primary mt-5 tab:mt-[min(1.75rem,4dvh)]">
              {t.live}
            </a>
          ) : (
            <button onClick={() => showToast(quick.notifyToast(t.title))} className="btn-primary mt-5 tab:mt-[min(1.75rem,4dvh)]">
              {t.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
