import { getDictionary } from "@/lib/i18n/server";

export async function Philosophy() {
  const { philosophy: t } = await getDictionary();

  return (
    <section id="philosophy" className="border-y border-acute-stone/50 bg-acute-cream">
      <div className="container-acute py-12 tab:py-14 desk:py-16">
        <div className="grid gap-4 desk:grid-cols-12 desk:gap-12">
          <p className="eyebrow desk:col-span-3">{t.eyebrow}</p>
          <h2 className="heading-section desk:col-span-9">
            {t.line1}
            <br />
            <span className="text-acute-ink/40">{t.line2}</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-10 tab:grid-cols-2 desk:mt-12 desk:grid-cols-12 desk:gap-12">
          {t.pillars.map((p, i) => (
            <article
              key={p.title}
              className={i === 0 ? "desk:col-span-4 desk:col-start-4" : "desk:col-span-4 desk:col-start-9"}
            >
              <span className="font-serif text-sm text-acute-red">0{i + 1}</span>
              <h3 className="caps mt-4 text-[1.5rem] desk:text-[1.75rem]">
                {p.title}
              </h3>
              <div className="mt-5 h-px w-12 bg-acute-stone" />
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-acute-ink-light">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
