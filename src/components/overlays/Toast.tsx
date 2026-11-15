"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/ui-store";

export function Toast() {
  const toast = useUI((s) => s.toast);
  const hide = useUI((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hide, 2600);
    return () => clearTimeout(timer);
  }, [toast, hide]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      {toast && (
        <p
          key={toast.id}
          className="animate-fade-up rounded-full bg-acute-ink px-6 py-3 text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.16em] text-acute-cream shadow-xl"
        >
          {toast.message}
        </p>
      )}
    </div>
  );
}
