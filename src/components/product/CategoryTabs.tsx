import { cn } from "@/lib/utils";
import type { Category } from "@/types/product";

export type CategoryOption = { value: Category | "all"; label: string; count: number };

interface Props {
  options: CategoryOption[];
  active: Category | "all";
  onChange: (value: Category | "all") => void;
  label: string;
}

/** Pill tabs; scrolls sideways on narrow screens instead of wrapping. */
export function CategoryTabs({ options, active, onChange, label }: Props) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 tab:mx-0 tab:flex-wrap tab:px-0"
    >
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "shrink-0 rounded-full border px-5 py-[10px] text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-soft",
              isActive
                ? "border-acute-red bg-acute-red text-acute-cream"
                : "border-acute-line bg-acute-cream-light text-acute-ink hover:border-acute-ink",
            )}
          >
            {opt.label}
            <span className={cn("ml-1.5", isActive ? "text-acute-cream/70" : "text-acute-stone")}>
              {opt.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
