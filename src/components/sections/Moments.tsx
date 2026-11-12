import { ArrowRight } from "lucide-react";
import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { MOMENTS, type Moment } from "@/types/product";

const tone: Record<Moment, PlaceholderTone> = {
  Work: "stone",
  Weekend: "blue",
  Evening: "ink",
  Everyday: "sand",
};

export async function Moments() {
  const { home: { moments: t } } = await getDictionary();

  return (
    <section id="moments" className="container-acute py-20 desk:py-28">
      <div className="rv text-center">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="caps mt-4 text-[44px] tab:text-[60px] desk:text-[72px]">{t.title}</h2>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-3 tab:gap-5 desk:grid-cols-4">
        {MOMENTS.map((m) => (
          <li key={m} className="rv">
            <a href="#shop" className="group block">
              <div className="relative overflow-hidden rounded-card">
                <EditorialPlaceholder tone={tone[m]} label={m} className="aspect-[3/4] w-full" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-acute-ink/55 to-transparent p-5 pt-16">
                  <span className="caps block text-[32px] text-acute-cream tab:text-[40px]">{m}</span>
                </span>
              </div>
              <p className="mt-3 text-[14px] leading-snug text-acute-ink-light">{t.items[m]}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-acute-red">
                {t.shop} {m}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
