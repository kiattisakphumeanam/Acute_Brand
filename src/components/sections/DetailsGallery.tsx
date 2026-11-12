import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const tiles: { tone: PlaceholderTone; shape: string }[] = [
  { tone: "sand", shape: "rounded-full" },
  { tone: "blue", shape: "rounded-arch" },
  { tone: "stone", shape: "rounded-card" },
  { tone: "cream", shape: "hex" },
];

/** Close-up craft details, each cropped to one of the brand shapes. */
export async function DetailsGallery() {
  const { home: { details: t } } = await getDictionary();

  return (
    <section id="details" className="bg-acute-cream-light py-20 desk:py-28">
      <div className="container-acute">
        <div className="rv">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="caps mt-4 text-[44px] tab:text-[60px]">{t.title}</h2>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 desk:grid-cols-4 desk:gap-8">
          {t.items.map((caption, i) => (
            <li key={caption} className="rv group text-center">
              <EditorialPlaceholder
                tone={tiles[i % tiles.length].tone}
                label={caption}
                className={cn("mx-auto aspect-square w-full max-w-[280px]", tiles[i % tiles.length].shape)}
              />
              <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.2em]">{caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
