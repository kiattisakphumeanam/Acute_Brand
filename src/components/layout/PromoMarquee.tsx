import { getDictionary } from "@/lib/i18n/server";

/** Thin red announcement bar above the header. The list is doubled so the loop is seamless. */
export async function PromoMarquee() {
  const { promo } = await getDictionary();
  const items = [...promo, ...promo];

  return (
    <div className="relative z-50 overflow-hidden bg-acute-red text-acute-cream">
      <p className="sr-only">{promo.join(" · ")}</p>
      <div aria-hidden className="flex w-max animate-marquee py-[9px] hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0">
            {items.map((msg, i) => (
              <li
                key={`${copy}-${i}`}
                className="flex items-center whitespace-nowrap px-8 text-[11px] font-semibold uppercase tracking-[0.24em]"
              >
                <span className="mr-8 text-[8px] text-acute-red-light">◆</span>
                {msg}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
