import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

type Props = (ButtonProps | LinkProps) & { variant?: Variant };

/**
 * Brand button. Primary Red for the one main action on a view; outline and ghost for the rest.
 * Renders a Next.js <Link> when given `href`, otherwise a <button>.
 */
export function Button({ variant = "primary", className, ...props }: Props) {
  const classes = cn(variants[variant], className);

  if (props.href !== undefined) {
    return <Link {...(props as LinkProps)} className={classes} />;
  }
  const { type = "button", ...rest } = props as ButtonProps;
  return <button type={type} {...rest} className={classes} />;
}
