import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MediaSlotEditor } from "@/components/admin/MediaSlotEditor";
import { SITE_MEDIA } from "@/data/site-media";
import { requireAdmin } from "@/lib/auth";
import { fallbackMedia, type SiteMediaRow } from "@/lib/site-media";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Site media | Admin | ACUTE" };

export default async function AdminMediaPage() {
  // Layouts and pages render in parallel, so the page checks too — never rely on the layout alone.
  await requireAdmin();

  // Read fresh (not the storefront's cache) so an upload shows here straight away
  const supabase = await createSupabaseServerClient();
  const { data, error } = (await supabase?.from("site_media").select("*")) ?? { data: null, error: null };
  const rows = new Map(((data ?? []) as SiteMediaRow[]).map((r) => [r.slot, r]));

  return (
    <>
      <Link href="/admin" className="btn-ghost">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Products
      </Link>
      <p className="eyebrow mt-10">Admin</p>
      <h1 className="caps mt-4 text-[2.75rem] tab:text-[3.5rem]">Site media</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-acute-ink/60">
        The photos and videos in each section of the site. Uploading here replaces what visitors see right away, with no
        code change. Remove an upload to go back to the built-in file.
      </p>

      {!supabase && <p className="mt-10 text-sm text-acute-red">Supabase isn&apos;t configured. Add the keys to .env.local.</p>}
      {error && (
        <p className="mt-10 text-sm text-acute-red">
          Couldn&apos;t load site media: {error.message}. Have you run supabase/schema.sql in the SQL Editor?
        </p>
      )}

      {/* Jump links: the page is long once every section is listed */}
      <nav aria-label="Sections" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-y border-acute-line py-4">
        {SITE_MEDIA.map((group) => (
          <a
            key={group.title}
            href={`#${group.slots[0].key.split(".")[0]}`}
            className="text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] underline-offset-4 hover:text-acute-red hover:underline"
          >
            {group.title}
          </a>
        ))}
      </nav>

      {SITE_MEDIA.map((group) => (
        <section key={group.title} id={group.slots[0].key.split(".")[0]} className="mt-14 scroll-mt-28">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-acute-ink pb-3">
            <h2 className="caps text-[1.75rem]">{group.title}</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-acute-ink/60">{group.where}</p>
          </div>
          <ul className="divide-y divide-acute-line border-b border-acute-line">
            {group.slots.map((slot) => {
              const row = rows.get(slot.key);
              return (
                <MediaSlotEditor
                  key={`${slot.key}-${row?.updated_at ?? "none"}`}
                  slot={slot}
                  media={row ?? null}
                  fallback={fallbackMedia(slot.key, rows)}
                />
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
