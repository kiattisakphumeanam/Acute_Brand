import { Globe, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";

const icons = [Truck, Globe, RotateCcw, ShieldCheck];

export async function FeatureRow() {
  const { home } = await getDictionary();

  return (
    <section className="border-t border-acute-line">
      <ul className="container-acute grid grid-cols-2 gap-y-10 py-14 desk:grid-cols-4">
        {home.features.map((f, i) => {
          const Icon = icons[i];
          return (
            <li key={f.title} className="flex flex-col items-center px-3 text-center">
              <span className="hex flex h-14 w-16 items-center justify-center bg-acute-blue text-acute-red">
                <Icon className="h-5 w-5" strokeWidth={1.4} />
              </span>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.2em]">{f.title}</p>
              <p className="mt-1.5 text-[13px] text-acute-ink-light">{f.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
