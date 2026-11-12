import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";
import type { Product } from "@/types/product";

const ROOT = path.join(process.cwd(), "public", "products");
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

/** "Still_Scene-Maxi skirt" → "still-scene-maxi-skirt", so folder names needn't match the slug exactly. */
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Folder per product: public/products/<slug>/1.jpg, 2.jpg, … (sorted by number, 1 = cover, 2 = hover).
 * Read on every call so new folders show up without a rebuild.
 */
function localGalleries(): Map<string, string[]> {
  const galleries = new Map<string, string[]>();
  let folders: string[] = [];
  try {
    folders = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return galleries; // no public/products yet
  }
  for (const folder of folders) {
    const files = readdirSync(path.join(ROOT, folder))
      .filter((f) => IMAGE.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (files.length) {
      galleries.set(
        normalize(folder),
        files.map((f) => `/products/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`),
      );
    }
  }
  return galleries;
}

/** Photos found in public/products/<slug>/ for one product. */
export function localGallery(slug: string): string[] {
  return localGalleries().get(normalize(slug)) ?? [];
}

/**
 * Final gallery per product: uploaded images (database) first, then the local folder.
 * image_url becomes the first of those so every view (cart, search, wishlist) shows the cover.
 */
export function withLocalImages(products: Product[]): Product[] {
  const galleries = localGalleries();
  return products.map((p) => {
    const uploaded = p.images ?? [];
    // A cover URL entered by hand that isn't part of the uploaded gallery still leads
    const stored = p.image_url && !uploaded.includes(p.image_url) ? [p.image_url, ...uploaded] : uploaded;
    const images = [...stored, ...(galleries.get(normalize(p.slug)) ?? [])];
    if (!images.length) return p;
    return { ...p, images, image_url: images[0] };
  });
}
