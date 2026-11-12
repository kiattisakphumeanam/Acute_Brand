import { cn } from "@/lib/utils";

/** The "ac" monogram from the brand pattern sheet. Colour it with a text class. */
export function AcIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden className={cn("h-8 w-auto", className)}>
      <text
        x="2"
        y="66"
        fill="currentColor"
        style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 92 }}
      >
        ac
      </text>
    </svg>
  );
}

/** Hand-drawn loop line, after the ribbon in the wordmark's T. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 80" fill="none" aria-hidden className={cn("h-16 w-auto", className)}>
      <path
        d="M4 56 C34 10 62 10 70 38 C78 66 46 70 52 44 C58 18 104 12 126 40 C140 58 160 62 176 44 C186 32 200 28 216 34"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
