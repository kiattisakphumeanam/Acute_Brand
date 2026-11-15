export const CATEGORIES = ["tops", "match_set", "skirt", "skort"] as const;

export type Category = (typeof CATEGORIES)[number];

export const MOMENTS = ["Work", "Weekend", "Evening", "Everyday"] as const;
export type Moment = (typeof MOMENTS)[number];

export type ProductStatus = "active" | "sold_out" | "coming_soon";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Price in whole Thai Baht (THB). Stripe receives it ×100 (satang). */
  price: number;
  category: Category;
  image_url: string | null;
  is_new: boolean;
  /** Gallery, first image first. Filled from public/products/<slug>/ when that folder exists. */
  images?: string[];
  // Storefront extras. Optional because the Supabase products table doesn't carry them yet.
  status?: ProductStatus;
  colors?: ProductColor[];
  sizes?: string[];
  /** Sizes that are out of stock. */
  sold_out_sizes?: string[];
  moment?: Moment;
}

/** What the cart stores — a snapshot for display only. Prices are re-read server-side at checkout. */
export interface CartLine extends Pick<Product, "id" | "name" | "price" | "category" | "image_url"> {
  /** Unique per product + size, so two sizes of one piece are separate lines. */
  key: string;
  size?: string;
  quantity: number;
}
