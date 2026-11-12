import { cn } from "@/lib/utils";

export type PlaceholderTone = "blue" | "sand" | "stone" | "ink" | "cream" | "red";

const tones: Record<PlaceholderTone, { bg: string; arch: string; text: string }> = {
  blue: { bg: "bg-acute-blue", arch: "bg-white/45", text: "text-acute-ink/60" },
  sand: { bg: "bg-acute-sand", arch: "bg-white/50", text: "text-acute-ink/60" },
  stone: { bg: "bg-[#D6CFC6]", arch: "bg-acute-cream/45", text: "text-acute-ink/60" },
  cream: { bg: "bg-acute-cream-light", arch: "bg-acute-blue/60", text: "text-acute-ink/60" },
  ink: { bg: "bg-acute-ink", arch: "bg-white/[0.07]", text: "text-acute-cream/60" },
  red: { bg: "bg-acute-red", arch: "bg-white/10", text: "text-acute-cream/70" },
};

interface Props {
  tone?: PlaceholderTone;
  caption?: string;
  label?: string;
  className?: string;
}

/**
 * Stand-in for editorial photography. Swap for <Image /> once real assets exist —
 * the wrapping element already defines the aspect ratio, radius and grid area.
 */
export function EditorialPlaceholder({ tone = "blue", caption, label, className }: Props) {
  const t = tones[tone];
  return (
    <div
      role="img"
      aria-label={label ?? caption ?? "Editorial image"}
      className={cn("relative overflow-hidden", t.bg, className)}
    >
      {/* Soft figure — an arch body with a head — suggests a model without pretending to be one */}
      <div className="absolute inset-0 transition-transform duration-700 ease-soft group-hover:scale-[1.04]">
        <div className={cn("absolute left-1/2 top-[18%] aspect-square w-[22%] -translate-x-1/2 rounded-full", t.arch)} />
        <div className={cn("absolute inset-x-[24%] bottom-0 top-[40%] rounded-arch", t.arch)} />
      </div>
      {caption && (
        <span
          className={cn(
            "absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-[0.24em]",
            t.text,
          )}
        >
          {caption}
        </span>
      )}
    </div>
  );
}
