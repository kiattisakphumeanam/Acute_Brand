import { AcIcon } from "@/components/ui/AcIcon";
import { getDictionary } from "@/lib/i18n/server";

/** Large serif ticker of the brand values between the hero and the shop. */
export async function PhilosophyMarquee() {
  const { home } = await getDictionary();
  const items = home.marquee;

  return (
    <div className="overflow-hidden border-y border-acute-line bg-acute-cream-light py-6">
      <p className="sr-only">{items.join(" · ")}</p>
      <div aria-hidden className="flex w-max animate-marquee-slow">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {[...items, ...items].map((item, i) => (
              <li key={`${copy}-${i}`} className="flex items-center">
                <span className={i % 2 ? "caps px-8 text-[40px] tab:text-[56px]" : "px-8 font-serif text-[40px] italic text-acute-red tab:text-[56px]"}>
                  {item}
                </span>
                <AcIcon className="h-7 text-acute-blue-dark" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
