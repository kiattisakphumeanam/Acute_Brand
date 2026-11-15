import "server-only";
import type { MemberStatus } from "@/lib/membership";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Membership status for the signed-in user. Points are worked out from paid orders
 * (1 per THB 100 of each order), since there is no separate points ledger yet.
 */
export async function getMemberStatus(userId: string): Promise<MemberStatus | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("member_since").eq("id", userId).single(),
    // RLS limits this to the user's own orders
    supabase.from("orders").select("amount_total, created_at").in("status", ["paid", "fulfilled"]),
  ]);

  const paid = orders ?? [];
  const since = profile?.member_since ? new Date(profile.member_since).getTime() : null;
  return {
    member: since !== null,
    // "First order" means first since joining — buying before becoming a member doesn't use it up
    paidOrders: since === null ? 0 : paid.filter((o) => new Date(o.created_at).getTime() >= since).length,
    points: paid.reduce((sum, o) => sum + Math.floor(o.amount_total / 100 / 100), 0), // satang → THB → per 100
  };
}
