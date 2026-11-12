import { getDictionary } from "@/lib/i18n/server";

export async function Philosophy() {
  const { philosophy: t } = await getDictionary();

  return (
    <section id="philosophy" className="border-y border-acute-stone/50 bg-acute-cream">
      <div className="container-acute py-28 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-12">
          <p className="eyebrow lg:col-span-3">{t.eyebrow}</p>
          <h2 className="heading-display text-4xl sm:text-5xl lg:col-span-9 lg:text-6xl">
            {t.line1}
            <br />
            <span className="text-acute-ink/40">{t.line2}</span>
          </h2>
        </div>

        <div className="mt-20 grid gap-16 lg:grid-cols-12 lg:gap-12">
          {t.pillars.map((p, i) => (
            <article
              key={p.title}
              className={i === 0 ? "lg:col-span-4 lg:col-start-4" : "lg:col-span-4 lg:col-start-9"}
            >
              <span className="font-serif text-sm text-acute-red">0{i + 1}</span>
              <h3 className="mt-4 font-serif text-2xl uppercase tracking-tight sm:text-3xl">
                {p.title}
              </h3>
              <div className="mt-6 h-px w-12 bg-acute-stone" />
              <p className="mt-6 leading-loose text-acute-ink/70">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
