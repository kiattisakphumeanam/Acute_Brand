import { BrandStory } from "@/components/sections/BrandStory";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { Hero } from "@/components/sections/Hero";
import { Moments } from "@/components/sections/Moments";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Hero />
      <ProductGrid products={products} preview />
      <Moments />
      <BrandStory />
      <FeatureRow />
    </>
  );
}
