import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm, type AdminProduct } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { localGallery } from "@/lib/product-images";
import { PRODUCT_COLUMNS } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit product — ACUTE Admin" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditProductPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);

  const supabase = await createSupabaseServerClient();
  const { data } = (await supabase
    ?.from("products")
    .select(`${PRODUCT_COLUMNS}, is_active, sort_order`)
    .eq("id", id)
    .maybeSingle()) ?? { data: null };
  if (!data) notFound();
  const product = data as AdminProduct;

  // Same order the shop uses: a hand-entered cover URL, then uploads, then the local folder
  const uploaded = product.images ?? [];
  const images = product.image_url && !uploaded.includes(product.image_url) ? [product.image_url, ...uploaded] : uploaded;

  return (
    <>
      <Link href="/admin" className="btn-ghost">
        <ArrowLeft className="h-3.5 w-3.5" /> All products
      </Link>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{product.is_active ? "Live on the shop" : "Hidden from the shop"}</p>
          <h1 className="caps mt-3 text-[40px] tab:text-[52px]">{product.name}</h1>
        </div>
        <Link href="/#shop" target="_blank" className="btn-outline">
          View shop <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {created && (
        <p className="mt-6 rounded-card bg-acute-blue px-5 py-4 text-sm">
          Product created. Now add its photos below — the first one is the cover, the second shows on hover.
        </p>
      )}

      <div className="mt-12 grid gap-14 desk:grid-cols-[1fr_1.1fr] desk:gap-16">
        <section>
          <h2 className="caps text-[28px]">Photos</h2>
          <p className="mt-2 text-sm text-acute-ink/60">
            Use the arrows to reorder. Square or 3:4 portrait, about 1200px wide, works best.
          </p>
          <div className="mt-6">
            <ImageManager productId={product.id} images={images} local={localGallery(product.slug)} />
          </div>
        </section>

        <section>
          <h2 className="caps text-[28px]">Details</h2>
          <div className="mt-6">
            <ProductForm product={product} />
          </div>
        </section>
      </div>

      <div className="mt-20 border-t border-acute-line pt-8">
        <DeleteProductButton id={product.id} name={product.name} />
      </div>
    </>
  );
}
