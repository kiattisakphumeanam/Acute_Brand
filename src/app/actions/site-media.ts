"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { MEDIA_SLOTS, MEDIA_TYPES, type MediaVariant } from "@/data/site-media";
import { requireAdmin } from "@/lib/auth";
import { SITE_MEDIA_TAG, type SiteMediaRow } from "@/lib/site-media";
import { createSupabaseServerClient, getSupabaseAdmin } from "@/lib/supabase/server";
import type { FormState } from "@/types/auth";

const BUCKET = "site-media";
const VARIANTS: MediaVariant[] = ["main", "mobile", "poster"];
const COLUMN = { main: "url", mobile: "mobile_url", poster: "poster_url" } as const;

/** Storage needs the service role here; requireAdmin() has already run in every caller. */
function storage() {
  return getSupabaseAdmin()?.storage.from(BUCKET) ?? null;
}

/** Public URL → path inside the bucket, or null for files hosted elsewhere. */
function storagePath(url: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url?.indexOf(marker) ?? -1;
  return url && i !== -1 ? decodeURIComponent(url.slice(i + marker.length)) : null;
}

async function removeFiles(urls: (string | null)[]) {
  const paths = urls.map(storagePath).filter((p): p is string => !!p);
  if (paths.length) await storage()?.remove(paths);
}

async function loadRow(slot: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data, error } = await supabase.from("site_media").select("*").eq("slot", slot).maybeSingle();
  if (error) throw new Error(`${error.message}. Have you run supabase/schema.sql?`);
  return { supabase, row: data as SiteMediaRow | null };
}

function revalidateMedia() {
  revalidateTag(SITE_MEDIA_TAG);
  // The menu's photos are on every page
  revalidatePath("/", "layout");
}

/** Which kind of file a variant may hold, or an error. Posters are stills; a mobile cut matches the main file. */
function checkKind(slot: string, variant: MediaVariant, kind: "image" | "video", main: SiteMediaRow | null) {
  const def = MEDIA_SLOTS.get(slot);
  if (!def) return "Unknown slot.";
  if (variant === "main" && def.accept !== "both" && def.accept !== kind) return `This slot takes a ${def.accept}.`;
  if (variant !== "main" && !main) return "Upload the main file first.";
  if (variant === "mobile" && !def.mobile) return "This slot has no phone version.";
  if (variant === "mobile" && main && kind !== main.kind) return `The phone version must be a ${main.kind} too.`;
  if (variant === "poster" && (kind !== "image" || main?.kind !== "video")) return "A poster is a photo for a video.";
  return null;
}

/**
 * Step 1 of an upload: checks the file and hands back a one-time signed URL.
 * The browser then sends the file straight to Supabase Storage, so videos never pass
 * through a Server Action (Vercel caps request bodies at about 4.5 MB).
 */
export async function prepareMediaUpload(
  slot: string,
  variant: MediaVariant,
  type: string,
  size: number,
): Promise<{ path: string; token: string } | { error: string }> {
  await requireAdmin();
  const bucket = storage();
  if (!bucket) return { error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local to upload media." };

  const fileType = MEDIA_TYPES[type];
  if (!fileType || !VARIANTS.includes(variant)) return { error: "Use JPG, PNG, WebP, AVIF, MP4 or WebM." };
  if (size > fileType.maxMB * 1024 * 1024) return { error: `That file is over ${fileType.maxMB} MB.` };

  try {
    const { row } = await loadRow(slot);
    const problem = checkKind(slot, variant, fileType.kind, row);
    if (problem) return { error: problem };
  } catch (err) {
    return { error: (err as Error).message };
  }

  const path = `${slot}/${variant}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileType.ext}`;
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Couldn't start the upload." };
  return { path: data.path, token: data.token };
}

/** Step 2: once the file is in Storage, point the slot at it and remove the file it replaces. */
export async function saveMediaUpload(slot: string, variant: MediaVariant, path: string): Promise<FormState> {
  await requireAdmin();
  const bucket = storage();
  const ext = path.split(".").pop();
  const fileType = Object.values(MEDIA_TYPES).find((t) => t.ext === ext);
  // Only paths prepareMediaUpload could have produced for this slot and variant
  if (!bucket || !fileType || !path.startsWith(`${slot}/${variant}-`)) return { error: "Upload not recognised." };

  try {
    const { supabase, row } = await loadRow(slot);
    const problem = checkKind(slot, variant, fileType.kind, row);
    if (problem) return { error: problem };

    const url = bucket.getPublicUrl(path).data.publicUrl;
    const updated_at = new Date().toISOString();
    let replaced: (string | null)[];
    let result;

    if (variant === "main") {
      // Switching between photo and video drops the extras that only fit the old kind
      const kindChanged = row && row.kind !== fileType.kind;
      replaced = [row?.url ?? null, ...(kindChanged ? [row.mobile_url, row.poster_url] : [])];
      result = await supabase.from("site_media").upsert({
        slot,
        kind: fileType.kind,
        url,
        updated_at,
        ...(kindChanged && { mobile_url: null, poster_url: null }),
      });
    } else {
      replaced = [row?.[COLUMN[variant]] ?? null];
      result = await supabase
        .from("site_media")
        .update({ [COLUMN[variant]]: url, updated_at })
        .eq("slot", slot);
    }

    if (result.error) {
      await bucket.remove([path]);
      return { error: result.error.message };
    }
    await removeFiles(replaced);
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidateMedia();
  return { message: "Saved. The site shows it now." };
}

/** Removes one file. Removing the main file empties the slot, so the site goes back to its fallback. */
export async function clearMedia(slot: string, variant: MediaVariant): Promise<FormState> {
  await requireAdmin();
  try {
    const { supabase, row } = await loadRow(slot);
    if (!row) return {};
    if (variant === "main") {
      const { error } = await supabase.from("site_media").delete().eq("slot", slot);
      if (error) return { error: error.message };
      await removeFiles([row.url, row.mobile_url, row.poster_url]);
    } else {
      const { error } = await supabase
        .from("site_media")
        .update({ [COLUMN[variant]]: null, updated_at: new Date().toISOString() })
        .eq("slot", slot);
      if (error) return { error: error.message };
      await removeFiles([row[COLUMN[variant]]]);
    }
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidateMedia();
  return { message: "Removed." };
}

/** Alt text in both languages; read aloud by screen readers and shown if the file fails to load. */
export async function saveMediaAlt(slot: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const alt_en = String(formData.get("alt_en") ?? "").trim().slice(0, 200);
  const alt_th = String(formData.get("alt_th") ?? "").trim().slice(0, 200);
  try {
    const { supabase, row } = await loadRow(slot);
    if (!row) return { error: "Upload a file first." };
    const { error } = await supabase.from("site_media").update({ alt_en, alt_th }).eq("slot", slot);
    if (error) return { error: error.message };
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidateMedia();
  return { message: "Saved." };
}
