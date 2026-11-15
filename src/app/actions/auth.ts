"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";
import type { FormState } from "@/types/auth";

const NOT_CONFIGURED = "Sign-in isn't configured yet. Add the Supabase keys to .env.local.";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"));

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    return { error: "Please confirm your email first. Check your inbox for the link we sent." };
  }
  if (error) return { error: "Incorrect email or password." };

  redirect(next);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"));

  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }, // copied into public.profiles by the on_auth_user_created trigger
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    return { error: "Too many sign-up emails were sent just now. Please wait a while and try again." };
  }
  if (error) return { error: error.message };

  // Email confirmation disabled in Supabase → we already have a session.
  if (data.session) redirect(next);
  return { message: "Almost there. Check your inbox to confirm your email." };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
