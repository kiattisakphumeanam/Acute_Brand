import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/types/auth";

/** The signed-in user with their role, or null for public visitors. Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  // Always per-request — even when built without Supabase keys, so adding keys later just works.
  await connection();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role: profile?.role === "admin" ? "admin" : "customer",
  };
});

/** Use at the top of pages/actions that need any signed-in user. */
export async function requireUser(next = "/"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Use at the top of admin pages/actions. Non-admins are sent home. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}
