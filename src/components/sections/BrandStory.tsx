import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export function ValueCard({ index, title, body, className }: { index: number; title: string; body: string; className?: string }) {
  return (
    <article className={cn("rv rounded-card border border-acute-line bg-acute-cream-light p-6", className)}>
      <span className="hex flex h-11 w-12 items-center justify-center bg-acute-blue font-serif text-lg text-acute-red">
        0{index + 1}
      </span>
      <h3 className="caps mt-4 text-[1.5rem] desk:text-[1.75rem]">{title}</h3>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-acute-ink-light">{body}</p>
    </article>
  );
}

export async function BrandStory() {
  const { home: { story: t } } = await getDictionary();

  return (
    <section id="story" className="border-t border-acute-line py-12 tab:py-14 desk:py-16">
      <div className="container-acute grid items-center gap-10 tab:grid-cols-[1fr_1.1fr] tab:gap-10 desk:gap-12">
        <div className="rv relative mx-auto w-full max-w-[24rem]">
          <div className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-arch">
            <Image src="/story/story1.jpg" alt={t.title} fill sizes="(min-width: 1040px) 380px, 82vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-6 right-0 aspect-square w-[44%] overflow-hidden rounded-card border-[0.375rem] border-acute-cream">
            <Image src="/story/story2.jpg" alt="" fill sizes="(min-width: 1040px) 200px, 44vw" className="object-cover" />
          </div>
        </div>

        <div className="rv">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="heading-section mt-3">{t.title}</h2>
          <p className="mt-5 text-[1rem] leading-relaxed text-acute-ink-light">{t.body}</p>
          <Link href="/about" className="btn-outline mt-7">
            {t.cta}
          </Link>
        </div>
      </div>

      <div className="container-acute mt-12 grid gap-4 tab:grid-cols-3 desk:gap-6">
        {t.values.map((v, i) => (
          <ValueCard key={v.title} index={i} title={v.title} body={v.body} />
        ))}
      </div>
    </section>
  );
}
