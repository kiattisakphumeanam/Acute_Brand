import { cn } from "@/lib/utils";

type Level = "h1" | "h2" | "h3" | "h4";
type Size = "xl" | "lg" | "md" | "sm";

const sizes: Record<Size, string> = {
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
};

// Without an explicit size, the visual scale follows the heading level
const defaultSize: Record<Level, Size> = { h1: "xl", h2: "lg", h3: "md", h4: "sm" };

interface Props {
  as?: Level;
  size?: Size;
  /** Small sans-serif label above the heading, e.g. "Lookbook — Vol. 04" */
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
}

/** Bold uppercase serif display heading with tight tracking and compact leading. */
export function Heading({ as: Tag = "h2", size, eyebrow, className, children }: Props) {
  const heading = (
    <Tag className={cn("heading-display text-acute-ink", sizes[size ?? defaultSize[Tag]], className)}>
      {children}
    </Tag>
  );

  if (!eyebrow) return heading;
  return (
    <div>
      <p className="eyebrow mb-5">{eyebrow}</p>
      {heading}
    </div>
  );
}
