import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

// Paired by index with the translated captions in the dictionary.
const looks: { tone: PlaceholderTone; offset: string }[] = [
  { tone: "sand", offset: "" },
  { tone: "ink", offset: "tab:mt-24" },
  { tone: "stone", offset: "tab:mt-12" },
];

export async function Lookbook() {
  const { lookbook: t } = await getDictionary();

  return (
    <section id="lookbook" className="bg-acute-blue">
      <div className="container-acute py-12 tab:py-14 desk:py-16">
        <div className="flex flex-col justify-between gap-6 tab:flex-row tab:items-end">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="heading-section mt-3">{t.title}</h2>
          </div>
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-acute-ink-light">
            {t.body}
          </p>
        </div>

        <div className="mt-8 grid gap-4 tab:mt-10 tab:grid-cols-3 tab:gap-6">
          {looks.map((look, i) => (
            <EditorialPlaceholder
              key={look.tone}
              tone={look.tone}
              caption={t.captions[i]}
              className={cn("group aspect-[3/4]", look.offset)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
