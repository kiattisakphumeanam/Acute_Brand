import Link from "next/link";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export function ValueCard({ index, title, body, className }: { index: number; title: string; body: string; className?: string }) {
  return (
    <article className={cn("rv rounded-card border border-acute-line bg-acute-cream-light p-7", className)}>
      <span className="hex flex h-11 w-12 items-center justify-center bg-acute-blue font-serif text-lg text-acute-red">
        0{index + 1}
      </span>
      <h3 className="caps mt-6 text-[30px]">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-acute-ink-light">{body}</p>
    </article>
  );
}

export async function BrandStory() {
  const { home: { story: t } } = await getDictionary();

  return (
    <section id="story" className="border-t border-acute-line py-20 desk:py-28">
      <div className="container-acute grid items-center gap-12 desk:grid-cols-[1fr_1.1fr] desk:gap-20">
        <div className="rv relative mx-auto w-full max-w-[460px]">
          <EditorialPlaceholder tone="stone" label={t.title} className="aspect-[4/5] w-[82%] rounded-arch" />
          <EditorialPlaceholder
            tone="blue"
            label=""
            className="absolute -bottom-6 right-0 aspect-square w-[44%] rounded-card border-[6px] border-acute-cream"
          />
        </div>

        <div className="rv">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="caps mt-4 text-[44px] tab:text-[60px]">{t.title}</h2>
          <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-acute-ink-light">{t.body}</p>
          <Link href="/about" className="btn-outline mt-8">
            {t.cta}
          </Link>
        </div>
      </div>

      <div className="container-acute mt-16 grid gap-4 tab:grid-cols-3 desk:mt-24 desk:gap-6">
        {t.values.map((v, i) => (
          <ValueCard key={v.title} index={i} title={v.title} body={v.body} />
        ))}
      </div>
    </section>
  );
}
