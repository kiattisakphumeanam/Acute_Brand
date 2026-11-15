import { BrandStory } from "@/components/sections/BrandStory";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { Hero } from "@/components/sections/Hero";
import { Moments } from "@/components/sections/Moments";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { StoreList } from "@/components/sections/StoreList";
import { getProducts } from "@/lib/products";
import { CATEGORIES, type Category } from "@/types/product";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const [products, { category }] = await Promise.all([getProducts(), searchParams]);
  const initialCategory = (CATEGORIES as readonly string[]).includes(category ?? "")
    ? (category as Category)
    : "all";

  return (
    <>
      <Hero />
      {/* Re-keyed so a mega-menu category link resets the active tab */}
      <ProductGrid key={initialCategory} products={products} initialCategory={initialCategory} preview />
      <Moments />
      <BrandStory />
      <StoreList />
      <FeatureRow />
    </>
  );
}
