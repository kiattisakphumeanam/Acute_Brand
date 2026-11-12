import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

// Paired by index with the translated captions in the dictionary.
const looks: { tone: PlaceholderTone; offset: string }[] = [
  { tone: "sand", offset: "" },
  { tone: "ink", offset: "md:mt-24" },
  { tone: "stone", offset: "md:mt-12" },
];

export async function Lookbook() {
  const { lookbook: t } = await getDictionary();

  return (
    <section id="lookbook" className="bg-acute-blue">
      <div className="container-acute py-24 lg:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="heading-display mt-4 text-4xl sm:text-5xl lg:text-6xl">{t.title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-acute-ink/70">
            {t.body}
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 md:gap-6">
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
