import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { mockProducts } from "@/data/mock-products";
import { withLocalImages } from "@/lib/product-images";
import { getSupabase } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export const PRODUCT_COLUMNS =
  "id, slug, name, description, price, category, image_url, images, is_new, status, colors, sizes, sold_out_sizes, moment";

/** Cache tag for the catalog. Admin actions call revalidateTag(PRODUCTS_TAG) after any product change. */
export const PRODUCTS_TAG = "products";

/**
 * Active product rows, cached across requests so page views don't each hit Supabase.
 * Throws on error so a failed fetch is never cached; the 5-minute revalidate is a safety net
 * for edits made directly in the Supabase dashboard.
 */
const fetchActiveProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is not configured");
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data as Product[];
  },
  ["active-products"],
  { tags: [PRODUCTS_TAG], revalidate: 300 },
);

/** All active products for the catalog. Falls back to mock data if Supabase is unconfigured or errors. */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!getSupabase()) return withLocalImages(mockProducts);
  try {
    // Local photos are merged outside the cache so new public/products folders show up right away
    return withLocalImages(await fetchActiveProducts());
  } catch (error) {
    console.error("[products] Supabase fetch failed, using mock data:", (error as Error).message);
    return withLocalImages(mockProducts);
  }
});

/** One active product for /products/[slug], read from the cached catalog. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

/** Source of truth for checkout pricing — never trust prices sent from the browser. Deliberately uncached. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return mockProducts.filter((p) => ids.includes(p.id));

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .in("id", ids);

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return data as Product[];
}

