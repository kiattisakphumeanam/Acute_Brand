import Image from "next/image";
import { EditorialPlaceholder, type PlaceholderTone } from "@/components/ui/EditorialPlaceholder";
import type { Category } from "@/types/product";
import { cn } from "@/lib/utils";

const toneByCategory: Record<Category, PlaceholderTone> = {
  tops: "blue",
  match_set: "stone",
  skirt: "sand",
  skort: "sand",
};

interface Props {
  src: string | null;
  alt: string;
  category: Category;
  sizes?: string;
  className?: string;
  /** Set for the above-the-fold image so it isn't lazy-loaded. */
  priority?: boolean;
}

export function ProductImage({ src, alt, category, sizes, className, priority }: Props) {
  if (!src) {
    return (
      <EditorialPlaceholder
        tone={toneByCategory[category] ?? "sand"}
        label={alt}
        className={cn("h-full w-full", className)}
      />
    );
  }
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-acute-sand", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"}
        className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
      />
    </div>
  );
}
