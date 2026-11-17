import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { getDictionary } from "@/lib/i18n/server";
import { getMembershipMedia } from "@/lib/site-media";
import { cn } from "@/lib/utils";

/** Membership is connected from the account page — signed-out visitors sign in or sign up on the way. */
async function JoinLink({ className }: { className: string }) {
  const { membership: t } = await getDictionary();
  return (
    <Link href="/account?connect=1" className={className}>
      {t.cta}
    </Link>
  );
}

/** Banner set in /admin/media; until then the home hero's footage, or a photo when there is no video.
 *  Slides up under the header, which rests transparent over it (see Header). */
export async function MembershipHero() {
  const { membership: t, home: { hero: h } } = await getDictionary();
  const { video, photo } = await getMembershipMedia();

  return (
    <section className="relative isolate -mt-[var(--header-h)] flex h-[calc(26rem+var(--header-h))] items-end overflow-hidden bg-acute-ink text-acute-cream tab:h-[calc(30rem+var(--header-h))]">
      {video ? (
        <HeroVideo video={video} pauseLabel={h.pauseVideo} playLabel={h.playVideo} />
      ) : (
        <Image src={photo} alt="" fill priority sizes="100vw" className="object-cover object-[center_30%]" />
      )}
      {/* Same shading as the home hero: the lower left for the copy, the top for the white header */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-acute-ink/70 via-acute-ink/20 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[calc(var(--header-h)+3rem)] bg-gradient-to-b from-acute-ink/35 to-transparent" />
      <div className="container-acute relative pb-10 tab:pb-14">
        <p className="text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.24em] text-acute-cream/85">{t.eyebrow}</p>
        <h1 className="caps mt-3 text-[2.5rem] tab:text-[3.5rem]">{t.title}</h1>
        <p className="mt-4 max-w-[28rem] text-[0.9375rem] leading-relaxed text-acute-cream/85 tab:text-[1rem]">{t.intro}</p>
        <JoinLink className="btn-primary mt-6" />
      </div>
    </section>
  );
}

export async function MembershipTiers() {
  const { membership: t } = await getDictionary();
  const top = t.tiers.length - 1;

  return (
    <section id="tiers" className="container-acute py-12 tab:py-14 desk:py-16">
      <div className="rv">
        <p className="eyebrow">{t.tiersEyebrow}</p>
        <h2 className="heading-section mt-3">{t.tiersTitle}</h2>
      </div>

      <ol className="rv mt-8 grid overflow-hidden rounded-card border border-acute-line tab:mt-10 tab:grid-cols-3">
        {t.tiers.map((tier, i) => (
          <li
            key={tier.name}
            className={cn(
              "flex flex-col p-6 desk:p-8",
              i > 0 && "border-t border-acute-line tab:border-l tab:border-t-0",
              // The top tier is the one to aim for — set apart in brand blue
              i === top ? "bg-acute-blue" : "bg-acute-cream-light",
            )}
          >
            <span className="font-serif text-sm text-acute-red">0{i + 1}</span>
            <h3 className="caps mt-3 text-[1.75rem]">{tier.name}</h3>
            <p className="mt-2 text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-red">
              {tier.range}
            </p>
            <div className="mt-5 h-px w-12 bg-acute-stone" />
            <ul className="mt-5 space-y-3">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex gap-3 text-[0.9375rem] leading-snug text-acute-ink-light">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-acute-red" strokeWidth={1.5} />
                  {perk}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

export async function MembershipCompare() {
  const { membership: t } = await getDictionary();

  return (
    <section id="compare" className="border-y border-acute-line bg-acute-cream-light py-12 tab:py-14 desk:py-16">
      <div className="container-acute">
        <div className="rv">
          <p className="eyebrow">{t.compareEyebrow}</p>
          <h2 className="heading-section mt-3">{t.compareTitle}</h2>
        </div>

        {/* Scrolls sideways on narrow phones rather than squeezing the tier columns */}
        <div className="rv mt-8 overflow-x-auto tab:mt-10">
          <table className="w-full min-w-[34rem] border-collapse text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b border-acute-ink">
                <th scope="col" className="w-[28%] py-4 pr-4 text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-stone">
                  {t.tierLabel}
                </th>
                {t.tiers.map((tier) => (
                  <th key={tier.name} scope="col" className="caps px-4 py-4 text-center text-[1.25rem] font-medium tab:text-[1.5rem]">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row) => (
                <tr key={row.label} className="border-b border-acute-line">
                  <th scope="row" className="py-4 pr-4 font-normal text-acute-ink">
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td key={i} className="px-4 py-4 text-center text-acute-ink-light">
                      {typeof value === "string" ? (
                        value
                      ) : value ? (
                        <>
                          <Check className="mx-auto h-4 w-4 text-acute-red" strokeWidth={1.75} aria-hidden />
                          <span className="sr-only">{t.included}</span>
                        </>
                      ) : (
                        <>
                          <span aria-hidden className="text-acute-stone">—</span>
                          <span className="sr-only">{t.notIncluded}</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export async function MembershipTerms() {
  const { membership: t } = await getDictionary();

  return (
    <section id="terms" className="container-acute grid gap-10 py-12 tab:py-14 desk:grid-cols-12 desk:gap-12 desk:py-16">
      <div className="rv desk:col-span-4">
        <p className="eyebrow">{t.termsEyebrow}</p>
        <h2 className="heading-section mt-3">{t.termsTitle}</h2>
        <div className="mt-8 border-t border-acute-line pt-6">
          <p className="caps text-[1.5rem]">{t.joinTitle}</p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-acute-ink-light">{t.joinBody}</p>
          <JoinLink className="btn-outline mt-5" />
        </div>
      </div>

      <div className="rv border-t border-acute-ink desk:col-span-7 desk:col-start-6">
        {t.terms.map((term, i) => (
          <details key={term.title} open={i === 0} className="group border-b border-acute-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <span className="font-serif text-[1.125rem] tab:text-[1.25rem]">{term.title}</span>
              <Plus className="h-4 w-4 shrink-0 text-acute-red transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="pb-6 text-[0.9375rem] leading-relaxed text-acute-ink-light">{term.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
