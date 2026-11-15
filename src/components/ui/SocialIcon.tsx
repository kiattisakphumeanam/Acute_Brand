import { cn } from "@/lib/utils";

/** Brand app icon for a social network, keyed by its label in SOCIALS. */
export function SocialIcon({ name, className }: { name: string; className?: string }) {
  // Hover animations live in globals.css (.social, .social-icon, [data-brand])
  const box = cn("social-icon flex h-7 w-7 items-center justify-center overflow-hidden", className);

  switch (name) {
    case "Instagram":
      return (
        <span
          aria-hidden
          data-brand="instagram"
          className={cn(
            box,
            "rounded-[0.5rem] bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]",
          )}
        >
          <svg viewBox="0 0 24 24" className="h-[72%] w-[72%]" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="1.2" fill="#fff" stroke="none" />
          </svg>
        </span>
      );
    default:
      return null;
  }
}
