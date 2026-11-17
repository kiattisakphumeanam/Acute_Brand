import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { getMomentImages } from "@/lib/site-media";
import { MOMENTS, type Moment } from "@/types/product";

const tone: Record<Moment, PlaceholderTone> = {
  Work: "stone",
  Weekend: "blue",
  Evening: "ink",
  Everyday: "sand",
};

export async function Moments() {
  const { home: { moments: t } } = await getDictionary();
  // Set in /admin/media; public/moments/ (work.jpg, weekend.jpg, …) until then, else a placeholder
  const images = await getMomentImages();

  return (
    <section id="moments" className="container-acute py-12 tab:py-14 desk:py-16">
      <div className="rv text-center">
        <h2 className="heading-section">{t.title}</h2>
      </div>

      {/* One card per row on phones, two on tablet, four on desktop */}
      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 tab:mt-10 tab:grid-cols-4 tab:gap-x-5 desk:gap-x-6">
        {MOMENTS.map((m) => (
          <li key={m} className="rv flex">
            <Link href={`/products?moment=${m}`} className="group flex w-full flex-col">
              <div className="relative overflow-hidden rounded-card">
                {images[m] ? (
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={images[m].src}
                      alt={images[m].alt}
                      fill
                      sizes="(min-width: 1040px) 25vw, (min-width: 760px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <EditorialPlaceholder tone={tone[m]} label={m} className="aspect-[4/5] w-full" />
                )}
                {/* Name centred on the photo; the scrim is darkest behind it so it reads even on a white shirt */}
                <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgb(47_49_53/0.45),rgb(47_49_53/0.12)_70%)] px-4 text-center">
                  <span className="caps text-[1.25rem] text-acute-cream tab:text-[1.5rem] desk:text-[1.75rem]">{m}</span>
                </span>
              </div>
              <p className="mt-3 text-[length:max(0.875rem,13px)] leading-snug text-acute-ink-light">{t.items[m]}</p>
              <span className="mt-auto inline-flex items-center gap-2 self-start pt-3 text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-red">
                {t.shop} {m}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
