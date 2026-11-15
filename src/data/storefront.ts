import type { PlaceholderTone } from "@/components/ui/EditorialPlaceholder";

/** Mega-menu groups. Labels stay in English in both locales, like the brand's tags. */
export interface MenuGroup {
  label: string;
  href: string;
  feature: { title: string; tone: PlaceholderTone; href: string };
  columns: { title: string; links: { label: string; href: string }[] }[];
}

/** One link per shop category; ?category= preselects the tab on /products. */
const CATEGORY_LINKS = [
  { label: "Top", href: "/products?category=tops" },
  { label: "Match Set", href: "/products?category=match_set" },
  { label: "Skirt", href: "/products?category=skirt" },
  { label: "Skort", href: "/products?category=skort" },
];

export const MENU: MenuGroup[] = [
  {
    label: "New In",
    href: "/#shop",
    feature: { title: "The Intentional Edit", tone: "blue", href: "/#shop" },
    columns: [
      {
        title: "Shop by Collection",
        links: [
          { label: "AW26 The Quiet Hours", href: "/#launch" },
          { label: "The Intentional Edit", href: "/#shop" },
          { label: "All Items", href: "/products" },
        ],
      },
      {
        title: "Shop by Category",
        links: CATEGORY_LINKS,
      },
    ],
  },
  {
    label: "Clothing",
    href: "/#shop",
    feature: { title: "Everyday Essentials", tone: "sand", href: "/#shop" },
    columns: [
      {
        title: "Shop by Category",
        links: [{ label: "All Items", href: "/products" }, ...CATEGORY_LINKS],
      },
    ],
  },
  {
    label: "Moments",
    href: "/#moments",
    feature: { title: "Work to Evening", tone: "stone", href: "/#moments" },
    columns: [
      {
        title: "Dress for",
        links: [
          { label: "Work", href: "/products?moment=Work" },
          { label: "Weekend", href: "/products?moment=Weekend" },
          { label: "Evening", href: "/products?moment=Evening" },
          { label: "Everyday", href: "/products?moment=Everyday" },
        ],
      },
    ],
  },
  {
    label: "Lookbook",
    href: "/#story",
    feature: { title: "Our Story", tone: "blue", href: "/#story" },
    columns: [
      {
        title: "Stories",
        links: [
          { label: "Our Story", href: "/#story" },
          { label: "Our Philosophy", href: "/about" },
        ],
      },
    ],
  },
  {
    label: "Info",
    href: "/about",
    feature: { title: "The Circle", tone: "ink", href: "/signup" },
    columns: [
      {
        title: "ACUTE",
        links: [
          { label: "About", href: "/about" },
          { label: "Membership", href: "/signup" },
        ],
      },
    ],
  },
];

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/acute.official_" },
];


/** Countdown target for the next collection drop. */
export const LAUNCH_AT = "2026-12-12T10:00:00+07:00";

/** Spend this much (THB) for the free tote. */
export const FREE_TOTE_THB = 4000;

export const CURRENCIES = {
  THB: { symbol: "฿", rate: 1 },
  USD: { symbol: "$", rate: 1 / 35.5 },
  SGD: { symbol: "S$", rate: 1 / 26.5 },
  JPY: { symbol: "¥", rate: 4.2 },
} as const;

export type Currency = keyof typeof CURRENCIES;
export const CURRENCY_COOKIE = "acute-currency";

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && value in CURRENCIES;
}

/** Membership rules — keep in step with the membership page and its terms. Applied by src/lib/membership.ts. */
export const MEMBERSHIP = {
  /** New members: off their first paid order, no cap */
  firstOrderRate: 0.05,
  /** Tiers by points, highest first. Morning Tea (0–99) has no ongoing discount. */
  tiers: [
    { id: "acute", name: "ACUTE", minPoints: 500, rate: 0.1, capTHB: 100 },
    { id: "lunch_coffee", name: "Lunch Coffee", minPoints: 100, rate: 0.05, capTHB: 50 },
  ],
  /** Points per THB 100 spent: everyone earns 1, the ACUTE tier 1.5 */
  pointsPer100: 1,
  acutePointsPer100: 1.5,
} as const;
