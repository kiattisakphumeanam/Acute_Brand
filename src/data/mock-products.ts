import type { Product } from "@/types/product";

const CREAM = { name: "Cream", hex: "#F1EADF" };
const INK = { name: "Ink", hex: "#2F3135" };
const RED = { name: "Brick", hex: "#AE3C31" };
const SKY = { name: "Sky", hex: "#DCE7F2" };
const STONE = { name: "Stone", hex: "#B7AFA6" };
const SIZES = ["XS", "S", "M", "L"];

/** Fallback catalog used when Supabase env vars are not set. Mirrors supabase/schema.sql seed data. */
export const mockProducts: Product[] = [
  {
    // Photos: public/products/still_scene_maxi_skirt/
    id: "still-scene-maxi-skirt",
    slug: "still-scene-maxi-skirt",
    name: "Still Scene Maxi Skort",
    description:
      "Tiered maxi skort in crinkled voile with ruched bands and an elastic waist. Free size, waist 24 to 42\", hips 46\", length 31.5\".",
    price: 1890, // TODO: real price
    category: "skort",
    image_url: null,
    is_new: true,
    colors: [{ name: "White", hex: "#FBFBF8" }],
    sizes: ["F"],
    moment: "Weekend",
  },
  {
    id: "soft-wool-cardigan",
    slug: "soft-wool-cardigan",
    name: "Soft Wool Cardigan",
    description: "Fine-gauge merino blend, made for layering.",
    price: 2790,
    category: "tops",
    image_url: null,
    is_new: false,
    status: "sold_out",
    colors: [CREAM, STONE],
    sizes: SIZES,
    sold_out_sizes: SIZES,
    moment: "Weekend",
  },
  {
    id: "ribbed-tank",
    slug: "ribbed-tank",
    name: "Ribbed Scoop Tank",
    description: "Everyday rib-knit tank with a low scoop.",
    price: 890,
    category: "tops",
    image_url: null,
    is_new: false,
    colors: [CREAM, INK, RED, SKY],
    sizes: SIZES,
    moment: "Everyday",
  },
  {
    id: "bias-slip-skirt",
    slug: "bias-slip-skirt",
    name: "Bias Slip Skirt",
    description: "Bias-cut satin that moves with you.",
    price: 1990,
    category: "skirt",
    image_url: null,
    is_new: false,
    status: "coming_soon",
    colors: [SKY, RED],
    sizes: SIZES,
    moment: "Evening",
  },
  {
    id: "boxy-knit-vest",
    slug: "boxy-knit-vest",
    name: "Boxy Knit Vest",
    description: "Cropped and boxy, in brushed cotton yarn.",
    price: 1590,
    category: "tops",
    image_url: null,
    is_new: false,
    colors: [STONE, CREAM],
    sizes: SIZES,
    moment: "Weekend",
  },
];
