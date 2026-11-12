import { MapPin } from "lucide-react";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { STORES } from "@/data/storefront";
import { getDictionary } from "@/lib/i18n/server";

export async function StoreList() {
  const { home: { stores: t } } = await getDictionary();

  return (
    <section id="stores" className="container-acute py-20 desk:py-28">
      <div className="rv flex flex-col justify-between gap-6 tab:flex-row tab:items-end">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="caps mt-4 text-[44px] tab:text-[60px]">{t.title}</h2>
        </div>
      </div>

      <ul className="mt-12 grid gap-5 tab:grid-cols-2 desk:grid-cols-4">
        {STORES.map((s, i) => (
          <li key={s.name} className="rv overflow-hidden rounded-card border border-acute-line bg-acute-cream-light">
            <EditorialPlaceholder tone={i % 2 ? "blue" : "sand"} label={s.name} className="aspect-[4/3] w-full" />
            <div className="p-6">
              <p className="caps text-[26px]">{s.name}</p>
              <p className="mt-3 flex items-start gap-2 text-[14px] text-acute-ink-light">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-acute-red" strokeWidth={1.5} />
                {s.area}, {s.city}
              </p>
              <p className="mt-1.5 pl-6 text-[13px] text-acute-stone">
                {t.hours} {s.hours}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${s.area} ${s.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost mt-5"
              >
                {t.cta}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
