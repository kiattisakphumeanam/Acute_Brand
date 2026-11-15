"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useUser } from "@/components/auth/AuthProvider";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { AcIcon } from "@/components/ui/AcIcon";
import { EditorialPlaceholder } from "@/components/ui/EditorialPlaceholder";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const SEEN_KEY = "acute-member-seen";
/** Off for now — visitors already find the member offer in the hero slideshow. Set to true to bring the invite back. */
const AUTO_OPEN = false;

/** Membership invite. When AUTO_OPEN is on, opens by itself once per session, 3s after load, for signed-out visitors. */
export function MemberModal() {
  const user = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const open = useUI((s) => s.memberOpen);
  const setOpen = useUI((s) => s.setMemberOpen);

  useEffect(() => {
    if (!AUTO_OPEN || user) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Storage blocked — fall through and show it once for this page load
    }
    if (seen) return;
    const timer = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }, 3000);
    return () => clearTimeout(timer);
  }, [user, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setOpen(false);
    router.push(`/signup?email=${encodeURIComponent(String(email ?? ""))}`);
  };

  return (
    <div className={cn("fixed inset-0 z-[70] flex items-center justify-center p-4", !open && "pointer-events-none")} inert={!open}>
      <div
        onClick={() => setOpen(false)}
        className={cn("absolute inset-0 bg-acute-ink/45 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
      />
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-title"
          className="relative grid max-h-full w-full max-w-[48.75rem] animate-fade-up grid-cols-1 overflow-y-auto overscroll-contain rounded-card bg-acute-cream tab:grid-cols-[1fr_1.15fr] tab:overflow-hidden"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label={t.member.close}
            className="hex absolute right-4 top-4 z-10 flex h-10 w-11 items-center justify-center bg-acute-blue transition-colors hover:bg-acute-red hover:text-acute-cream"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <div className="ac-pattern relative hidden bg-acute-blue p-8 tab:block">
            <EditorialPlaceholder tone="cream" label="" className="absolute inset-x-10 bottom-0 top-12 rounded-arch" />
          </div>

          <div className="min-w-0 p-6 tab:p-10">
            <AcIcon className="h-9 text-acute-red" />
            <p className="eyebrow mt-5">{t.member.eyebrow}</p>
            <h2 id="member-title" className="caps mt-3 text-[2rem] tab:text-[2.5rem]">{t.member.title}</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-acute-ink-light">{t.member.body}</p>
            <ul className="mt-5 space-y-2">
              {t.member.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-3.5 w-3.5 text-acute-red" /> {perk}
                </li>
              ))}
            </ul>
            <form onSubmit={submit} className="mt-6 space-y-3 tab:mt-7">
              <input
                type="email"
                name="email"
                required
                placeholder={t.member.email}
                aria-label={t.member.email}
                className="w-full rounded-full border border-acute-line bg-acute-cream-light px-5 py-[0.8125rem] text-sm outline-none focus:border-acute-ink"
              />
              <button type="submit" className="btn-primary w-full">
                {t.member.cta}
              </button>
            </form>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-center text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] text-acute-stone hover:text-acute-ink"
            >
              {t.member.dismiss}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
