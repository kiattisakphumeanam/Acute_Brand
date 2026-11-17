import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { MENU } from "@/data/storefront";
import { getHeroVideo, getSlideVideo, type HeroVideoFiles } from "@/lib/hero-video";
import { momentImages, slideImage } from "@/lib/product-images";
import { getLocale } from "@/lib/i18n/server";
import { getSupabase } from "@/lib/supabase/server";
import { MOMENTS, type Moment } from "@/types/product";

/** Cache tag for site media. /admin/media calls revalidateTag(SITE_MEDIA_TAG) after every change. */
export const SITE_MEDIA_TAG = "site-media";

export interface SiteMedia {
  kind: "image" | "video";
  url: string;
  mobile_url: string | null;
  poster_url: string | null;
  alt_en: string;
  alt_th: string;
}

export type SiteMediaRow = SiteMedia & { slot: string; updated_at: string };

/** Throws on error so a failed fetch is never cached. */
const fetchSiteMedia = unstable_cache(
  async (): Promise<SiteMediaRow[]> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is not configured");
    const { data, error } = await supabase.from("site_media").select("*");
    if (error) throw new Error(error.message);
    return data as SiteMediaRow[];
  },
  ["site-media"],
  { tags: [SITE_MEDIA_TAG], revalidate: 300 },
);

/** Uploaded media by slot. Empty when Supabase is unconfigured or schema.sql hasn't been run yet. */
export const getSiteMedia = cache(async (): Promise<Map<string, SiteMediaRow>> => {
  if (!getSupabase()) return new Map();
  try {
    return new Map((await fetchSiteMedia()).map((row) => [row.slot, row]));
  } catch (error) {
    console.error("[site-media] Supabase fetch failed, using files in public/:", (error as Error).message);
    return new Map();
  }
});

const MENU_SLOTS: Record<string, string> = {
  "menu.new-in": "New In",
  "menu.clothing": "Clothing",
  "menu.moments": "Moments",
  "menu.lookbook": "Lookbook",
};

/**
 * What a slot shows while nothing is uploaded: the file it used before /admin/media existed,
 * or for the membership banner, whatever the home hero shows (`uploaded` holds the other slots).
 */
export function fallbackMedia(
  slot: string,
  uploaded: Map<string, SiteMediaRow>,
): { kind: "image" | "video"; url: string } | null {
  const image = (url: string | undefined) => (url ? { kind: "image" as const, url } : null);
  const video = (v: { src: string } | null | undefined) => (v ? { kind: "video" as const, url: v.src } : null);

  if (slot === "home.hero") return video(getHeroVideo());
  if (slot === "home.offer") return image(slideImage("offer", "Evening"));
  if (slot === "home.launch") return video(getSlideVideo("hero3")) ?? image(slideImage("launch", "Work"));
  if (slot === "membership.hero") {
    const hero = uploaded.get("home.hero");
    const story = uploaded.get("story.main")?.url ?? "/story/story1.jpg";
    return hero ? { kind: hero.kind, url: hero.url } : (video(getHeroVideo()) ?? image(story));
  }
  if (slot === "story.main") return image("/story/story1.jpg");
  if (slot === "story.detail") return image("/story/story2.jpg");
  if (slot.startsWith("moments.")) {
    const moment = (slot.slice(8, 9).toUpperCase() + slot.slice(9)) as Moment;
    return image(momentImages()[moment]);
  }
  if (slot in MENU_SLOTS) return image(MENU.find((g) => g.label === MENU_SLOTS[slot])?.feature.image);
  return null;
}

const VIDEO_TYPES: Record<string, string> = { mp4: "video/mp4", webm: "video/webm" };
const videoType = (url: string) => VIDEO_TYPES[url.split(".").pop()?.toLowerCase() ?? ""] ?? "video/mp4";

/** Hero slide 1: the uploaded video, else public/videos/hero.mp4 (+ hero-mobile, hero-poster). */
export async function getHeroMedia(): Promise<HeroVideoFiles | null> {
  const row = (await getSiteMedia()).get("home.hero");
  if (row?.kind !== "video") return getHeroVideo();
  return {
    src: row.url,
    type: videoType(row.url),
    mobile: row.mobile_url ? { src: row.mobile_url, type: videoType(row.mobile_url) } : undefined,
    poster: row.poster_url ?? undefined,
  };
}

/** Hero slide 2: the uploaded photo, else public/slides/offer.jpg, else a Moments photo. */
export async function getOfferPhoto(): Promise<string | undefined> {
  return (await getSiteMedia()).get("home.offer")?.url ?? slideImage("offer", "Evening");
}

/** Hero slide 3: an uploaded video or photo, else public/videos/hero3.mp4, else public/slides/launch.jpg. */
export async function getLaunchMedia(): Promise<{ video?: { src: string; type: string }; photo?: string }> {
  const row = (await getSiteMedia()).get("home.launch");
  if (row) return row.kind === "video" ? { video: { src: row.url, type: videoType(row.url) } } : { photo: row.url };
  const video = getSlideVideo("hero3");
  return video ? { video } : { photo: slideImage("launch", "Work") };
}

/** /membership banner: its own upload, else the home hero's video, else the main story photo. */
export async function getMembershipMedia(): Promise<{ video?: HeroVideoFiles; photo: string }> {
  const uploaded = await getSiteMedia();
  const row = uploaded.get("membership.hero");
  const photo = uploaded.get("story.main")?.url ?? "/story/story1.jpg";
  if (row?.kind === "image") return { photo: row.url };
  if (row?.kind === "video") {
    return { video: { src: row.url, type: videoType(row.url), poster: row.poster_url ?? undefined }, photo };
  }
  return { video: (await getHeroMedia()) ?? undefined, photo };
}

/** Alt text in the visitor's language, falling back to English, then to `fallback`. */
async function altFor(row: SiteMediaRow | undefined, fallback: string) {
  if (!row) return fallback;
  const th = (await getLocale()) === "th" ? row.alt_th : "";
  return th || row.alt_en || fallback;
}

/** Moments cards: uploaded photos, else public/moments/<moment>.jpg. Moments with neither keep their placeholder. */
export async function getMomentImages(): Promise<Partial<Record<Moment, { src: string; alt: string }>>> {
  const [uploaded, local] = [await getSiteMedia(), momentImages()];
  const images: Partial<Record<Moment, { src: string; alt: string }>> = {};
  for (const m of MOMENTS) {
    const row = uploaded.get(`moments.${m.toLowerCase()}`);
    const src = row?.url ?? local[m];
    if (src) images[m] = { src, alt: await altFor(row, m) };
  }
  return images;
}

/** Our story's two photos: uploaded, else public/story/story1.jpg and story2.jpg. */
export async function getStoryImages(mainAlt: string) {
  const uploaded = await getSiteMedia();
  const main = uploaded.get("story.main");
  return {
    main: { src: main?.url ?? "/story/story1.jpg", alt: await altFor(main, mainAlt) },
    detail: uploaded.get("story.detail")?.url ?? "/story/story2.jpg",
  };
}

/** Uploaded mega menu photos by group label; groups not listed keep feature.image from src/data/storefront.ts. */
export async function getMenuImages(): Promise<Record<string, string>> {
  const uploaded = await getSiteMedia();
  const images: Record<string, string> = {};
  for (const [slot, label] of Object.entries(MENU_SLOTS)) {
    const url = uploaded.get(slot)?.url;
    if (url) images[label] = url;
  }
  return images;
}
