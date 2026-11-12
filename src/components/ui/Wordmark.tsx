import { cn } from "@/lib/utils";

/**
 * The ACUTE wordmark, from images/acute-wordmark.svg. Fills and strokes use `currentColor`
 * instead of the file's fixed red, so size it with a height class and colour it with a text class.
 */
export function Wordmark({ className, title = "ACUTE" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="30 44 1012 232"
      // Pass title="" when a parent (e.g. a labelled link) already names it
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      className={cn("h-6 w-auto", className)}
    >
      <g fill="none" stroke="currentColor" strokeWidth={27} strokeLinejoin="miter" strokeMiterlimit={4}>
        {/* C */}
        <path d="M384 114 A80 80 0 1 0 384 240" />
        {/* U */}
        <path d="M485 88 V196 A56 56 0 0 0 597 196 V88" />
        {/* E */}
        <path d="M1030 101.5 H921.5 V252.5 H1032" />
        <path d="M921 180 H1016" />
      </g>
      <g fill="currentColor">
        {/* A */}
        <path fillRule="evenodd" d="M36 266 L98 88 H124 L188 266 H159 L144 222 H78 L63 266 Z M85 199 H137 L111 124 Z" />
        {/* T — tapered stem with curled foot */}
        <path d="M762 50 C763 76 770 104 770 140 L770 214 C770 246 780 260 802 263 L801 266.5 C766 266.5 753 250 753 218 L753 140 C754 104 760 76 762 50 Z" />
      </g>
      {/* T — ribbon (infinity) crossbar */}
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
        d="M762 99 C742 86 678 84 666 94 C656 104 700 110 762 99 C824 88 846 92 848 99 C850 108 792 112 762 99 Z"
      />
    </svg>
  );
}
