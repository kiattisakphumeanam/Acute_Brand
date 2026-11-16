"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import type { MemberStatus } from "@/lib/membership";
import { getMemberStatus } from "@/lib/membership-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MembershipState = { ok?: boolean; error?: string } | undefined;

// Digits with optional +, spaces, dashes or brackets — 9 to 15 digits in all
const PHONE = /^\+?[\d\s\-()]+$/;

/** "Connect membership" popup on /account: saves name, phone and birthday, and marks the profile a member. */
export async function connectMembership(_prev: MembershipState, form: FormData): Promise<MembershipState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };

  const fullName = String(form.get("full_name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const birthday = String(form.get("birthday") ?? "");

  if (!fullName || fullName.length > 120) return { error: "Please enter your full name." };
  const digits = phone.replace(/\D/g, "").length;
  if (!PHONE.test(phone) || digits < 9 || digits > 15) return { error: "Please enter a valid phone number." };
  const born = new Date(`${birthday}T00:00:00Z`);
  const age = (Date.now() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || Number.isNaN(age) || age < 0 || age > 120) {
    return { error: "Please enter a valid birthday." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Membership isn't configured yet. Add the Supabase keys to .env.local." };

  const { data: current } = await supabase
    .from("profiles")
    .select("full_name, phone, birthday, member_since, member_cancelled_at")
    .eq("id", user.id)
    .single();
  // Keep the original join date when a member edits their details or rejoins after cancelling
  const memberSince: string = current?.member_since ?? new Date().toISOString();

  // Saved here first: becoming a member gives the profile its customer number (ac-001…), which the sheet needs
  const { data: saved, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, birthday, member_since: memberSince, member_cancelled_at: null })
    .eq("id", user.id)
    .select("customer_id")
    .maybeSingle();
  if (error || !saved?.customer_id) {
    console.error(
      "[membership]",
      error?.message ?? (saved ? "no customer_id — run supabase/schema.sql" : `no profile row for ${user.id} — run supabase/schema.sql`),
    );
    return { error: "We couldn't save your membership. Please try again." };
  }

  // The sheet is the team's member list — if it fails, put the profile back so nothing is left half-saved.
  // The customer number stays with the profile, so trying again reuses it.
  const sent = await sendToSheet({
    customerId: saved.customer_id,
    userId: user.id,
    email: user.email,
    fullName,
    birthday,
    phone,
    status: "active",
    memberSince,
    cancelledAt: "",
  });
  if (!sent) {
    await supabase
      .from("profiles")
      .update({
        full_name: current?.full_name ?? null,
        phone: current?.phone ?? null,
        birthday: current?.birthday ?? null,
        member_since: current?.member_since ?? null,
        member_cancelled_at: current?.member_cancelled_at ?? null,
      })
      .eq("id", user.id);
    return { error: "We couldn't save your membership. Please try again." };
  }

  revalidatePath("/account");
  return { ok: true };
}

/**
 * "Cancel membership" on /account. Phone and birthday are deleted, as the member has withdrawn the reason we
 * held them; the customer number and join date stay, so rejoining reuses the number and the first-order
 * discount isn't given twice. The name stays too: it is the account's name, not membership data.
 */
export async function cancelMembership(_prev: MembershipState): Promise<MembershipState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Membership isn't configured yet. Add the Supabase keys to .env.local." };

  const { data: current } = await supabase
    .from("profiles")
    .select("customer_id, phone, birthday, member_since, member_cancelled_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!current?.member_since || current.member_cancelled_at || !current.customer_id) {
    return { error: "This account isn't a member." };
  }

  const cancelledAt = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({ phone: null, birthday: null, member_cancelled_at: cancelledAt })
    .eq("id", user.id);
  if (error) {
    console.error("[membership] cancel:", error.message);
    return { error: "We couldn't cancel your membership. Please try again." };
  }

  // The sheet row stays as a record of the number, but without the personal details
  const sent = await sendToSheet({
    customerId: current.customer_id,
    userId: user.id,
    email: user.email,
    fullName: "",
    birthday: "",
    phone: "",
    status: "cancelled",
    memberSince: current.member_since,
    cancelledAt,
  });
  if (!sent) {
    await supabase
      .from("profiles")
      .update({ phone: current.phone, birthday: current.birthday, member_cancelled_at: null })
      .eq("id", user.id);
    return { error: "We couldn't cancel your membership. Please try again." };
  }

  revalidatePath("/account");
  return { ok: true };
}

/**
 * Adds or updates the member's row in the Google Sheet (Apps Script web app in scripts/membership-sheet.gs).
 * Without MEMBERSHIP_SHEET_URL it is skipped, so local development works without a sheet.
 */
async function sendToSheet(member: {
  customerId: string;
  userId: string;
  email: string;
  fullName: string;
  birthday: string;
  phone: string;
  status: "active" | "cancelled";
  memberSince: string;
  cancelledAt: string;
}): Promise<boolean> {
  const url = process.env.MEMBERSHIP_SHEET_URL;
  if (!url) {
    console.warn("[membership] MEMBERSHIP_SHEET_URL is not set — not sent to the sheet");
    return true;
  }

  try {
    // Apps Script answers a POST with a redirect to the result; fetch follows it
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.MEMBERSHIP_SHEET_SECRET, ...member }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !result?.ok) {
      // A 403 page (not JSON) comes from Google itself: the web app isn't deployed with access "Anyone"
      const hint = res.status === 403 ? "web app access must be \"Anyone\" (Deploy → Manage deployments)" : result?.error;
      console.error("[membership] sheet rejected the row:", res.status, hint);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[membership] sheet request failed:", err);
    return false;
  }
}

/** The bag asks for this to show the member discount the shopper will get at checkout. */
export async function getMyMemberStatus(): Promise<MemberStatus | null> {
  const user = await getCurrentUser();
  return user ? getMemberStatus(user.id) : null;
}
