import "server-only";
import { pointsFor, type MemberStatus } from "@/lib/membership";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Membership status for the signed-in user. Points are worked out from paid orders
 * (per THB 100 of each order's item subtotal, before member discounts), since there is
 * no separate points ledger yet.
 */
export async function getMemberStatus(userId: string): Promise<MemberStatus | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("member_since").eq("id", userId).single(),
    // RLS limits this to the user's own orders
    supabase
      .from("orders")
      .select("created_at, order_items(unit_amount, quantity)")
      .in("status", ["paid", "fulfilled"])
      .order("created_at"),
  ]);

  const paid = orders ?? [];
  const since = profile?.member_since ? new Date(profile.member_since).getTime() : null;
  const member = since !== null;
  // "First order" means first since joining — buying before becoming a member doesn't use it up
  const paidOrders = since === null ? 0 : paid.filter((o) => new Date(o.created_at).getTime() >= since).length;

  // Oldest first: each order earns at the rate of the tier reached before it (1.5× once at ACUTE)
  let points = 0;
  for (const o of paid) {
    const subtotal = o.order_items.reduce((s, i) => s + i.unit_amount * i.quantity, 0);
    points += pointsFor(subtotal / 100, { member, paidOrders, points }); // satang → THB
  }
  return { member, paidOrders, points };
}
