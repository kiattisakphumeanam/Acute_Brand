"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient, getSupabaseAdmin } from "@/lib/supabase/server";
import type { FormState } from "@/types/auth";
import { CATEGORIES, MOMENTS, type Category, type ProductColor, type ProductStatus } from "@/types/product";

const STATUSES: ProductStatus[] = ["active", "sold_out", "coming_soon"];
const BUCKET = "products";
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** "XS, S , m" → ["XS", "S", "m"] */
function parseList(value: FormDataEntryValue | null) {
  return [...new Set(String(value ?? "").split(",").map((s) => s.trim()).filter(Boolean))];
}

/** "White #FBFBF8, Ink #2F3135" → [{ name, hex }]; null if any entry is malformed. */
function parseColors(value: FormDataEntryValue | null): ProductColor[] | null {
  const colors: ProductColor[] = [];
  for (const entry of parseList(value)) {
    const m = entry.match(/^(.+?)\s+(#[0-9a-f]{6})$/i);
    if (!m) return null;
    colors.push({ name: m[1].trim(), hex: m[2].toUpperCase() });
  }
  return colors;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateProduct(id?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/products/${id}`);
}

/** Validates the shared add/edit form. Returns the row to write, or an error message. */
function parseProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const price = Number(formData.get("price"));
  const category = String(formData.get("category")) as Category;
  const status = String(formData.get("status") ?? "active") as ProductStatus;
  const moment = String(formData.get("moment") ?? "") || null;
  const sizes = parseList(formData.get("sizes")).map((s) => s.toUpperCase());
  const soldOutSizes = parseList(formData.get("sold_out_sizes")).map((s) => s.toUpperCase());
  const colors = parseColors(formData.get("colors"));
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name || !slug) return { error: "Name is required." };
  if (!Number.isInteger(price) || price < 10) return { error: "Price must be a whole number of at least ฿10." };
  if (!CATEGORIES.includes(category)) return { error: "Choose a category." };
  if (!STATUSES.includes(status)) return { error: "Choose a status." };
  if (moment && !(MOMENTS as readonly string[]).includes(moment)) return { error: "Choose a moment." };
  if (!colors) return { error: 'Colours must look like "White #FFFFFF, Ink #2F3135".' };
  const unknown = soldOutSizes.filter((s) => !sizes.includes(s));
  if (unknown.length) return { error: `Sold-out sizes must also be in Sizes: ${unknown.join(", ")}` };
  if (!Number.isInteger(sortOrder)) return { error: "Sort order must be a whole number." };

  return {
    row: {
      name,
      slug,
      description: String(formData.get("description") ?? "").trim(),
      price,
      category,
      is_new: formData.get("is_new") === "on",
      status,
      colors,
      sizes,
      sold_out_sizes: soldOutSizes,
      moment,
      sort_order: sortOrder,
    },
  };
}

/**
 * Every admin action calls requireAdmin() first. RLS ("Admins manage products")
 * enforces the same rule in the database as a second layer.
 */
export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseProductForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase isn't configured." };

  const { data, error } = await supabase.from("products").insert(parsed.row).select("id").single();
  if (error) {
    return { error: error.code === "23505" ? `Slug "${parsed.row.slug}" is already used.` : error.message };
  }

  revalidateProduct();
  // Straight to the edit page so photos can be added next
  redirect(`/admin/products/${data.id}?created=1`);
}

export async function updateProduct(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseProductForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase isn't configured." };

  const { error } = await supabase.from("products").update(parsed.row).eq("id", id);
  if (error) {
    return { error: error.code === "23505" ? `Slug "${parsed.row.slug}" is already used.` : error.message };
  }

  revalidateProduct(id);
  return { message: "Saved." };
}

export async function setProductActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const result = await supabase?.from("products").update({ is_active: isActive }).eq("id", id);
  if (result?.error) throw new Error(result.error.message);
  revalidateProduct(id);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase isn't configured.");

  const { data } = await supabase.from("products").select("images").eq("id", id).single();
  const paths = ((data?.images as string[] | null) ?? []).map(storagePath).filter((p): p is string => !!p);
  if (paths.length) await storage()?.remove(paths);

  // order_items keep their name/price snapshot; product_id becomes null
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateProduct();
  redirect("/admin");
}

// ─────────────────────────────────────────────
// Images — Supabase Storage bucket "products", folder per product id
// ─────────────────────────────────────────────

/** Storage needs the service role here; requireAdmin() has already run in every caller. */
function storage() {
  return getSupabaseAdmin()?.storage.from(BUCKET) ?? null;
}

/** Public URL → path inside the bucket, or null for images hosted elsewhere. */
function storagePath(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

async function loadImages(id: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data, error } = await supabase.from("products").select("images, image_url").eq("id", id).single();
  if (error) throw new Error(error.message);
  const images = (data.images as string[] | null) ?? [];
  // Keep a hand-entered cover URL as the first image once the gallery is managed here
  const cover = data.image_url as string | null;
  return { supabase, images: cover && !images.includes(cover) ? [cover, ...images] : images };
}

async function saveImages(id: string, images: string[]) {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    ?.from("products")
    .update({ images, image_url: images[0] ?? null })
    .eq("id", id);
  if (result?.error) throw new Error(result.error.message);
  revalidateProduct(id);
}

export async function uploadProductImages(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const bucket = storage();
  if (!bucket) return { error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local to upload images." };

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose at least one image." };
  for (const file of files) {
    if (!IMAGE_TYPES[file.type]) return { error: `${file.name}: use JPG, PNG, WebP or AVIF.` };
    if (file.size > MAX_IMAGE_BYTES) return { error: `${file.name} is over 5 MB.` };
  }

  const { images } = await loadImages(id);
  const added: string[] = [];
  for (const file of files) {
    const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${IMAGE_TYPES[file.type]}`;
    const { error } = await bucket.upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) {
      if (added.length) await saveImages(id, [...images, ...added]);
      return { error: `${file.name}: ${error.message}` };
    }
    added.push(bucket.getPublicUrl(path).data.publicUrl);
  }

  await saveImages(id, [...images, ...added]);
  return { message: `Uploaded ${added.length} image${added.length === 1 ? "" : "s"}.` };
}

export async function moveProductImage(id: string, from: number, to: number) {
  await requireAdmin();
  const { images } = await loadImages(id);
  if (from < 0 || from >= images.length || to < 0 || to >= images.length) return;
  const next = [...images];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  await saveImages(id, next);
}

export async function removeProductImage(id: string, url: string) {
  await requireAdmin();
  const { images } = await loadImages(id);
  const path = storagePath(url);
  if (path) await storage()?.remove([path]);
  await saveImages(id, images.filter((u) => u !== url));
}
