import type { PlaceholderTone } from "@/components/ui/EditorialPlaceholder";

/** Mega-menu groups. Labels stay in English in both locales, like the brand's tags. */
export interface MenuGroup {
  label: string;
  href: string;
  feature: { title: string; tone: PlaceholderTone; href: string };
  columns: { title: string; links: { label: string; href: string }[] }[];
}

/** One link per shop category; ?category= preselects the tab in the product grid. */
const CATEGORY_LINKS = [
  { label: "Top", href: "/?category=tops#shop" },
  { label: "Match Set", href: "/?category=match_set#shop" },
  { label: "Skirt", href: "/?category=skirt#shop" },
  { label: "Skort", href: "/?category=skort#shop" },
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
          { label: "AW26 — The Quiet Hours", href: "/#launch" },
          { label: "The Intentional Edit", href: "/#shop" },
          { label: "All Items", href: "/#shop" },
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
        links: [{ label: "All Items", href: "/#shop" }, ...CATEGORY_LINKS],
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
          { label: "Work", href: "/#moments" },
          { label: "Weekend", href: "/#moments" },
          { label: "Evening", href: "/#moments" },
          { label: "Everyday", href: "/#moments" },
        ],
      },
    ],
  },
  {
    label: "Lookbook",
    href: "/#details",
    feature: { title: "In the Details", tone: "blue", href: "/#details" },
    columns: [
      {
        title: "Stories",
        links: [
          { label: "In the Details", href: "/#details" },
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
          { label: "Stores", href: "/#stores" },
          { label: "Wishlist", href: "/wishlist" },
        ],
      },
    ],
  },
];

export const SOCIALS = [
  { label: "Instagram", short: "IG", href: "https://instagram.com" },
  { label: "Facebook", short: "FB", href: "https://facebook.com" },
  { label: "TikTok", short: "TT", href: "https://tiktok.com" },
  { label: "LINE", short: "LINE", href: "https://line.me" },
];


export const STORES = [
  { name: "ACUTE Siam", area: "Siam Discovery, 3F", city: "Bangkok", hours: "10:00 – 22:00" },
  { name: "ACUTE Thonglor", area: "The Commons, G", city: "Bangkok", hours: "10:00 – 21:00" },
  { name: "ACUTE Iconsiam", area: "Iconsiam, 2F", city: "Bangkok", hours: "10:00 – 22:00" },
  { name: "ACUTE Nimman", area: "One Nimman, 1F", city: "Chiang Mai", hours: "11:00 – 21:00" },
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
