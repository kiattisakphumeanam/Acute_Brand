import { Globe, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";

const icons = [Truck, Globe, RotateCcw, ShieldCheck];

export async function FeatureRow() {
  const { home } = await getDictionary();

  return (
    <section className="border-t border-acute-line">
      <ul className="container-acute grid grid-cols-2 gap-y-8 py-10 tab:py-12 desk:grid-cols-4">
        {home.features.map((f, i) => {
          const Icon = icons[i];
          return (
            <li key={f.title} className="flex flex-col items-center px-3 text-center">
              <Icon className="h-6 w-6 text-acute-red" strokeWidth={1.3} aria-hidden />
              <p className="mt-4 text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em]">{f.title}</p>
              <p className="mt-1.5 text-[0.8125rem] text-acute-ink-light">{f.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
