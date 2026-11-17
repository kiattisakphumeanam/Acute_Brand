import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { setProductActive } from "@/app/actions/admin";
import type { AdminProduct } from "@/components/admin/ProductForm";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { requireAdmin } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { withLocalImages } from "@/lib/product-images";
import { PRODUCT_COLUMNS } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn, formatTHB } from "@/lib/utils";

const STATUS_LABEL = { active: "Active", sold_out: "Sold out", coming_soon: "Coming soon" } as const;

export default async function AdminProductsPage() {
  // Layouts and pages render in parallel, so the page checks too — never rely on the layout alone.
  await requireAdmin();

  // Admin RLS policy lets this query see hidden (inactive) products too.
  const supabase = await createSupabaseServerClient();
  const { data, error } = (await supabase
    ?.from("products")
    .select(`${PRODUCT_COLUMNS}, is_active, sort_order`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })) ?? { data: null, error: null };
  const products = withLocalImages((data ?? []) as AdminProduct[]) as AdminProduct[];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="caps mt-4 text-[2.75rem] tab:text-[3.5rem]">
            Products <span className="text-acute-stone">({products.length})</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/media" className="btn-outline">
            Site media
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      {!supabase && <p className="mt-10 text-sm text-acute-red">Supabase isn&apos;t configured. Add the keys to .env.local.</p>}
      {error && (
        <p className="mt-10 text-sm text-acute-red">
          Couldn&apos;t load products: {error.message}. Have you run supabase/schema.sql in the SQL Editor?
        </p>
      )}

      <ul className="mt-10 divide-y divide-acute-line border-y border-acute-line">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 py-4">
            <Link
              href={`/admin/products/${p.id}`}
              className={cn("flex min-w-0 flex-1 items-center gap-4", !p.is_active && "opacity-50")}
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[0.75rem_0.75rem_0_0.75rem]">
                {p.image_url ? (
                  <Image src={p.image_url} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <EditorialPlaceholder tone="sand" label="" className="h-full w-full" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-serif text-lg leading-tight hover:text-acute-red">{p.name}</p>
                <p className="mt-1 text-xs text-acute-ink/60">
                  {dictionaries.en.categories[p.category] ?? p.category} · /{p.slug}
                  {p.sizes?.length ? ` · ${p.sizes.join(" ")}` : ""}
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1.5 text-[length:max(0.625rem,10px)] font-semibold uppercase tracking-[0.16em]">
                  {!p.is_active && <span className="rounded-full bg-acute-ink px-2 py-0.5 text-acute-cream">Hidden</span>}
                  {p.status && p.status !== "active" && (
                    <span className="rounded-full bg-acute-blue px-2 py-0.5">{STATUS_LABEL[p.status]}</span>
                  )}
                  {p.is_new && <span className="rounded-full bg-acute-red px-2 py-0.5 text-acute-cream">New</span>}
                  {!p.images?.length && <span className="rounded-full border border-acute-red px-2 py-0.5 text-acute-red">No photos</span>}
                </p>
              </div>
            </Link>
            <span className="hidden text-sm tabular-nums tab:block">{formatTHB(p.price)}</span>
            <Link href={`/admin/products/${p.id}`} className="btn-outline px-4 py-2 text-[length:max(0.6875rem,10px)]">
              Edit
            </Link>
            <form action={setProductActive.bind(null, p.id, !p.is_active)}>
              <button
                className={cn(
                  "w-20 rounded-full border px-3 py-2 text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] transition-colors",
                  p.is_active
                    ? "border-acute-line hover:border-acute-ink"
                    : "border-acute-red text-acute-red hover:bg-acute-red hover:text-acute-cream",
                )}
              >
                {p.is_active ? "Hide" : "Show"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
