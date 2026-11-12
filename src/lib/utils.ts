export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

/** 1290 → "฿1,290" */
export function formatTHB(amount: number) {
  return thb.format(amount);
}

/** Only allow same-site relative redirects ("/account"), never "//evil.com" or absolute URLs. */
export function safeRedirectPath(path: unknown, fallback = "/") {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}
