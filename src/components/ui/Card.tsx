import { cn } from "@/lib/utils";

type Tone = "light" | "blue";

const tones: Record<Tone, string> = {
  // Neutral Light card on the cream page — separated by a hairline rather than a shadow
  light: "border border-acute-stone/50 bg-acute-cream",
  // Secondary Blue for soft, contrasting containers
  blue: "bg-acute-blue",
};

interface Props {
  tone?: Tone;
  eyebrow?: string;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Quiet content container: flat colour, generous padding, no radius or drop shadow. */
export function Card({ tone = "light", eyebrow, title, className, children }: Props) {
  return (
    <div className={cn("flex flex-col p-8 lg:p-10", tones[tone], className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && (
        <h3 className={cn("heading-display text-display-sm text-acute-ink", eyebrow && "mt-4")}>{title}</h3>
      )}
      {children && (
        <div className={cn("text-body text-acute-ink/75", (eyebrow || title) && "mt-5")}>{children}</div>
      )}
    </div>
  );
}
