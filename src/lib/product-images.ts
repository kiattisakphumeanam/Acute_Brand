import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";
import { MOMENTS, type Moment, type Product } from "@/types/product";

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

/**
 * Cover photo per moment: public/moments/work.jpg, weekend.png, … (any image type, name is case-insensitive).
 * Moments without a file keep their placeholder.
 */
export function momentImages(): Partial<Record<Moment, string>> {
  const images: Partial<Record<Moment, string>> = {};
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), "public", "moments")).filter((f) => IMAGE.test(f));
  } catch {
    return images; // no public/moments yet
  }
  for (const moment of MOMENTS) {
    const file = files.find((f) => f.replace(IMAGE, "").toLowerCase() === moment.toLowerCase());
    if (file) images[moment] = `/moments/${encodeURIComponent(file)}`;
  }
  return images;
}

/**
 * Photo for a hero slide: public/slides/<name>.jpg (any image type, name is case-insensitive).
 * Falls back to a Moments photo until the slide has its own.
 */
export function slideImage(name: string, fallback: Moment): string | undefined {
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), "public", "slides")).filter((f) => IMAGE.test(f));
  } catch {
    // no public/slides yet
  }
  const file = files.find((f) => f.replace(IMAGE, "").toLowerCase() === name.toLowerCase());
  return file ? `/slides/${encodeURIComponent(file)}` : momentImages()[fallback];
}

/** Photos found in public/products/<slug>/ for one product. */
export function localGallery(slug: string): string[] {
  return localGalleries().get(normalize(slug)) ?? [];
}

/**
 * Final gallery per product: uploaded images (database), or the local folder when nothing is uploaded.
 * The folder is only a fallback, so uploading in the admin replaces it.
 * image_url becomes the first of those so every view (cart, search) shows the cover.
 */
export function withLocalImages(products: Product[]): Product[] {
  const galleries = localGalleries();
  return products.map((p) => {
    const uploaded = p.images ?? [];
    // A cover URL entered by hand that isn't part of the uploaded gallery still leads
    const stored = p.image_url && !uploaded.includes(p.image_url) ? [p.image_url, ...uploaded] : uploaded;
    const images = stored.length ? stored : (galleries.get(normalize(p.slug)) ?? []);
    if (!images.length) return p;
    return { ...p, images, image_url: images[0] };
  });
}
