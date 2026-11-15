import { ProductGrid } from "@/components/sections/ProductGrid";
import { getProducts } from "@/lib/products";
import { CATEGORIES, MOMENTS, type Category, type Moment } from "@/types/product";

export const metadata = { title: "Shop all | ACUTE" };

type Props = { searchParams: Promise<{ category?: string; moment?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const [products, { category, moment }] = await Promise.all([getProducts(), searchParams]);
  const initialCategory = (CATEGORIES as readonly string[]).includes(category ?? "")
    ? (category as Category)
    : "all";
  const activeMoment = (MOMENTS as readonly string[]).includes(moment ?? "") ? (moment as Moment) : undefined;

  // Re-keyed so a category or moment link from the menu resets the active tab
  return (
    <ProductGrid
      key={`${initialCategory}-${activeMoment}`}
      products={activeMoment ? products.filter((p) => p.moment === activeMoment) : products}
      initialCategory={initialCategory}
      moment={activeMoment}
    />
  );
}
