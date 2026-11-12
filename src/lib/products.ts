import "server-only";
import { cache } from "react";
import { mockProducts } from "@/data/mock-products";
import { withLocalImages } from "@/lib/product-images";
import { getSupabase } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export const PRODUCT_COLUMNS =
  "id, slug, name, description, price, category, image_url, images, is_new, status, colors, sizes, sold_out_sizes, moment";

/** All active products for the catalog. Falls back to mock data if Supabase is unconfigured or errors. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = getSupabase();
  if (!supabase) return withLocalImages(mockProducts);

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[products] Supabase fetch failed, using mock data:", error.message);
    return withLocalImages(mockProducts);
  }
  return withLocalImages(data as Product[]);
});

/** Source of truth for checkout pricing — never trust prices sent from the browser. */
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
