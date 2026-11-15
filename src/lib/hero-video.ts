import "server-only";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

export interface HeroVideoFiles {
  /** Landscape video, used on every screen unless a mobile one exists. */
  src: string;
  type: string;
  /** Optional portrait cut for phones (< 760px). */
  mobile?: { src: string; type: string };
  /** Still frame shown while the video loads, and instead of it for reduced motion. */
  poster?: string;
}

const DIR = path.join(process.cwd(), "public", "videos");
const VIDEO = [
  ["mp4", "video/mp4"],
  ["webm", "video/webm"],
] as const;
const IMAGE = ["jpg", "jpeg", "webp", "png"];

/** Matched case-insensitively (hero3.MP4 counts) but served under the file's real name, which Linux hosts need. */
function find(base: string) {
  let files: string[] = [];
  try {
    files = readdirSync(DIR);
  } catch {
    return undefined; // no public/videos yet
  }
  for (const [ext, type] of VIDEO) {
    const file = files.find((f) => f.toLowerCase() === `${base}.${ext}`);
    if (file) return { src: `/videos/${encodeURIComponent(file)}`, type };
  }
  return undefined;
}

/**
 * Looks for public/videos/hero.mp4 (or .webm), plus optional hero-mobile.mp4 and hero-poster.jpg.
 * Checked on every request, so dropping a file in is enough — no code change or rebuild.
 */
export function getHeroVideo(): HeroVideoFiles | null {
  const main = find("hero");
  if (!main) return null;
  const posterExt = IMAGE.find((ext) => existsSync(path.join(DIR, `hero-poster.${ext}`)));
  return {
    ...main,
    mobile: find("hero-mobile"),
    poster: posterExt ? `/videos/hero-poster.${posterExt}` : undefined,
  };
}

/** Video for a hero slide's media panel, e.g. public/videos/hero3.mp4 for the third slide. */
export function getSlideVideo(name: string) {
  return find(name);
}
