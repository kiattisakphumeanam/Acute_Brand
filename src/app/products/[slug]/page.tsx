import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery, ProductPurchase } from "@/components/product/ProductDetails";
import { getDictionary } from "@/lib/i18n/server";
import { getProductBySlug, getProducts } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Not found | ACUTE" };
  return {
    title: `${product.name} | ACUTE`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, products, t] = await Promise.all([getProductBySlug(slug), getProducts(), getDictionary()]);
  if (!product) notFound();

  // Same category first, then fill up with the rest of the catalog
  const others = products.filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, 5);

  return (
    <div className="container-acute pb-12 pt-10 tab:pt-12 desk:pb-16 desk:pt-14">
      <Link
        href="/#shop"
        className="inline-flex items-center gap-1 text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] hover:text-acute-red"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        {t.product.backToShop}
      </Link>

      <div className="mt-8 grid gap-8 tab:grid-cols-2 tab:gap-12">
        <div className="overflow-hidden rounded-card">
          <ProductGallery product={product} sizes="(min-width: 760px) 50vw, 100vw" priority />
        </div>
        <div className="flex flex-col tab:sticky tab:top-[calc(var(--header-h)+1.5rem)] tab:self-start">
          <ProductPurchase product={product} headingLevel="h1" />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12 desk:mt-16">
          <h2 className="heading-section">{t.product.related}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 tab:mt-10 tab:grid-cols-3 tab:gap-x-5 desk:grid-cols-4 desk:gap-x-6 wide:grid-cols-5">
            {/* One row at every breakpoint: 2, 3, 4 and 5 columns */}
            {related.map((p, i) => (
              <div key={p.id} className={i >= 4 ? "hidden wide:block" : i >= 3 ? "hidden desk:block" : i >= 2 ? "hidden tab:block" : ""}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
