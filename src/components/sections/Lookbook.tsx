import Image from "next/image";
import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { getLookbook } from "@/lib/site-media";
import { cn } from "@/lib/utils";

// Placeholders until photos are added in /admin/media, paired by index with the dictionary's captions.
const placeholders: PlaceholderTone[] = ["sand", "ink", "stone"];
// Stagger by column: the middle one drops furthest, the last halfway (repeats on every row of three).
const offsets = ["", "tab:mt-24", "tab:mt-12"];

export async function Lookbook() {
  const { lookbook: t } = await getDictionary();
  const looks = await getLookbook();

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
          {looks.length > 0
            ? looks.map((look, i) => (
                <figure key={look.id} className={cn("relative aspect-[3/4] overflow-hidden", offsets[i % 3])}>
                  <Image
                    src={look.src}
                    alt={look.alt}
                    fill
                    sizes="(min-width: 760px) 33vw, 100vw"
                    className="object-cover"
                  />
                  {look.caption && (
                    <figcaption className="absolute bottom-4 left-4 text-[length:max(0.625rem,10px)] font-semibold uppercase tracking-[0.24em] text-acute-cream [text-shadow:0_1px_8px_rgb(47_49_53/0.5)]">
                      {look.caption}
                    </figcaption>
                  )}
                </figure>
              ))
            : placeholders.map((tone, i) => (
                <EditorialPlaceholder
                  key={tone}
                  tone={tone}
                  caption={t.captions[i]}
                  className={cn("group aspect-[3/4]", offsets[i])}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
