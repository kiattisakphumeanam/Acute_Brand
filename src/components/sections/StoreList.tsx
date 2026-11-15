import { MapPin } from "lucide-react";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { STORES } from "@/data/storefront";
import { getDictionary } from "@/lib/i18n/server";

export async function StoreList() {
  const { home: { stores: t } } = await getDictionary();

  return (
    <section id="stores" className="container-acute py-12 tab:py-14 desk:py-16">
      <div className="rv flex flex-col justify-between gap-6 tab:flex-row tab:items-end">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="heading-section mt-3">{t.title}</h2>
        </div>
      </div>

      <ul className="mt-8 grid gap-5 tab:mt-10 tab:grid-cols-2 desk:grid-cols-4">
        {STORES.map((s, i) => (
          <li key={s.name} className="rv flex flex-col overflow-hidden rounded-card border border-acute-line bg-acute-cream-light">
            <EditorialPlaceholder tone={i % 2 ? "blue" : "sand"} label={s.name} className="aspect-[4/3] w-full" />
            <div className="flex flex-1 flex-col p-5">
              <p className="caps text-[1.375rem] desk:text-[1.5rem]">{s.name}</p>
              <p className="mt-3 flex items-start gap-2 text-[0.875rem] text-acute-ink-light">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-acute-red" strokeWidth={1.5} />
                {s.area}, {s.city}
              </p>
              <p className="mb-5 mt-1.5 pl-6 text-[0.8125rem] text-acute-stone">
                {t.hours(s.opens, s.closes)}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${s.area} ${s.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost mt-auto self-start"
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
