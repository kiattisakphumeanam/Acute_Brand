/**
 * Every place on the storefront that shows a photo or video an admin can change in /admin/media.
 * Design decides the places (and their shape); admins decide what fills them.
 * Until something is uploaded, each slot shows its fallback from public/ (see src/lib/site-media.ts).
 */
export type MediaAccept = "image" | "video" | "both";

export interface MediaSlot {
  key: string;
  label: string;
  /** Shape and size advice shown next to the upload button */
  hint: string;
  accept: MediaAccept;
  /** Takes an optional portrait cut for phones */
  mobile?: boolean;
  /** Background only (hidden from screen readers), so no description is asked for */
  decorative?: boolean;
}

export interface MediaGroup {
  title: string;
  /** Where on the site this group appears */
  where: string;
  slots: MediaSlot[];
}

export const SITE_MEDIA: MediaGroup[] = [
  {
    title: "Hero slideshow",
    where: "Home, first screen",
    slots: [
      {
        key: "home.hero",
        label: "Slide 1 · Campaign",
        hint: "Video, landscape 16:9, MP4 under 15 MB. Add a 9:16 portrait cut for phones.",
        accept: "video",
        mobile: true,
        decorative: true,
      },
      {
        key: "home.offer",
        label: "Slide 2 · Member offer",
        hint: "Photo, portrait 4:5, at least 1400 px wide. Sits right of the red panel; top of frame stays in view on phones.",
        accept: "image",
        decorative: true,
      },
      {
        key: "home.launch",
        label: "Slide 3 · Launch countdown",
        hint: "Video (16:9, under 15 MB) fills the slide; a photo (4:5) sits beside the countdown.",
        accept: "both",
        decorative: true,
      },
    ],
  },
  {
    title: "Moments",
    where: "Home, under New arrivals",
    slots: [
      { key: "moments.work", label: "Work", hint: "Photo, portrait 4:5, at least 1200 px wide.", accept: "image" },
      { key: "moments.weekend", label: "Weekend", hint: "Photo, portrait 4:5, at least 1200 px wide.", accept: "image" },
      { key: "moments.evening", label: "Evening", hint: "Photo, portrait 4:5, at least 1200 px wide.", accept: "image" },
      { key: "moments.everyday", label: "Everyday", hint: "Photo, portrait 4:5, at least 1200 px wide.", accept: "image" },
    ],
  },
  {
    title: "Our story",
    where: "Home, above the footer",
    slots: [
      { key: "story.main", label: "Main photo", hint: "Photo, portrait 4:5, at least 1000 px wide.", accept: "image" },
      { key: "story.detail", label: "Detail photo", hint: "Photo, square 1:1, at least 600 px wide.", accept: "image", decorative: true },
    ],
  },
  {
    title: "Membership",
    where: "/membership, top banner",
    slots: [
      {
        key: "membership.hero",
        label: "Banner",
        hint: "Wide video or photo, at least 2400 px wide. The upper third stays in view. Leave empty to reuse the home hero video.",
        accept: "both",
        decorative: true,
      },
    ],
  },
  {
    title: "Menu",
    where: "Header dropdown, right half",
    slots: [
      { key: "menu.new-in", label: "New In", hint: "Photo, at least 1600 px wide. Cropped from the top.", accept: "image", decorative: true },
      { key: "menu.clothing", label: "Clothing", hint: "Photo, at least 1600 px wide. Cropped from the top.", accept: "image", decorative: true },
      { key: "menu.moments", label: "Moments", hint: "Photo, at least 1600 px wide. Cropped from the top.", accept: "image", decorative: true },
      { key: "menu.lookbook", label: "Lookbook", hint: "Photo, at least 1600 px wide. Cropped from the top.", accept: "image", decorative: true },
    ],
  },
];

export const MEDIA_SLOTS = new Map(SITE_MEDIA.flatMap((g) => g.slots).map((s) => [s.key, s]));

export type MediaVariant = "main" | "mobile" | "poster";

export const MEDIA_TYPES: Record<string, { ext: string; kind: "image" | "video"; maxMB: number }> = {
  "image/jpeg": { ext: "jpg", kind: "image", maxMB: 10 },
  "image/png": { ext: "png", kind: "image", maxMB: 10 },
  "image/webp": { ext: "webp", kind: "image", maxMB: 10 },
  "image/avif": { ext: "avif", kind: "image", maxMB: 10 },
  "video/mp4": { ext: "mp4", kind: "video", maxMB: 50 },
  "video/webm": { ext: "webm", kind: "video", maxMB: 50 },
};

/** What a slot's file input should accept for this variant (posters are always stills). */
export function acceptFor(slot: MediaSlot, variant: MediaVariant, mainKind?: "image" | "video") {
  const kind = variant === "poster" ? "image" : variant === "mobile" ? (mainKind ?? "image") : slot.accept;
  return Object.entries(MEDIA_TYPES)
    .filter(([, t]) => kind === "both" || t.kind === kind)
    .map(([type]) => type)
    .join(",");
}
