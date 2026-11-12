"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
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

/** Countdown to the next collection drop, in hexagon cells. */
export function LaunchCountdown({ launchAt }: { launchAt: string }) {
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
    <section id="launch" className="container-acute py-20 desk:py-28">
      <div className="rv grid items-center gap-12 overflow-hidden rounded-card bg-acute-blue p-6 tab:p-12 desk:grid-cols-[1fr_340px] desk:p-16">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="caps mt-4 text-[48px] tab:text-[72px]">{t.title}</h2>
          <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-acute-ink-light">{t.body}</p>

          <ol className="mt-10 flex flex-wrap gap-2 tab:gap-3" aria-label={t.title}>
            {t.units.map((unit, i) => (
              <li
                key={unit}
                className="hex flex h-[86px] w-[98px] flex-col items-center justify-center bg-acute-cream tab:h-[112px] tab:w-[128px]"
              >
                <span className="font-serif text-[34px] leading-none tabular-nums tab:text-[46px]">
                  {parts ? String(parts[i]).padStart(2, "0") : "--"}
                </span>
                <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-acute-red tab:text-[10px]">
                  {unit}
                </span>
              </li>
            ))}
          </ol>

          {live ? (
            <a href="#shop" className="btn-primary mt-10">
              {t.live}
            </a>
          ) : (
            <button onClick={() => showToast(quick.notifyToast(t.title))} className="btn-primary mt-10">
              {t.cta}
            </button>
          )}
        </div>

        <EditorialPlaceholder tone="cream" label={t.title} className="mx-auto aspect-[3/4] w-full max-w-[340px] rounded-arch" />
      </div>
    </section>
  );
}
