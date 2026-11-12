"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type NewsletterState = { ok?: boolean; error?: "invalid" | "failed" } | undefined;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeNewsletter(_prev: NewsletterState, form: FormData): Promise<NewsletterState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return { error: "invalid" };

  // Service role: the table has no public insert policy. Without Supabase configured, accept and move on.
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: true };

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("[newsletter]", error.message);
    return { error: "failed" };
  }
  return { ok: true };
}
