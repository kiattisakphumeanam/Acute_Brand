import { MEMBERSHIP } from "@/data/storefront";

/** What the server knows about a shopper's membership — see getMemberStatus(). */
export interface MemberStatus {
  member: boolean;
  /** Paid orders since joining; 0 means the next one is their first as a member */
  paidOrders: number;
  points: number;
}

export type MemberDiscount =
  | { kind: "first_order"; rate: number; amount: number }
  | { kind: "tier"; tier: string; rate: number; capTHB: number; amount: number };

/** Whole THB off this subtotal, or null. Shared by the bag and checkout so both show the same total. */
export function memberDiscount(subtotalTHB: number, status: MemberStatus | null): MemberDiscount | null {
  if (!status?.member || subtotalTHB <= 0) return null;

  if (status.paidOrders === 0) {
    const rate = MEMBERSHIP.firstOrderRate;
    return { kind: "first_order", rate, amount: Math.round(subtotalTHB * rate) };
  }

  const tier = MEMBERSHIP.tiers.find((t) => status.points >= t.minPoints);
  if (!tier) return null;
  return {
    kind: "tier",
    tier: tier.name,
    rate: tier.rate,
    capTHB: tier.capTHB,
    amount: Math.min(Math.round(subtotalTHB * tier.rate), tier.capTHB),
  };
}

/** Points this order earns (on the amount actually paid). ACUTE tier members earn 1.5 per THB 100. */
export function pointsFor(paidTHB: number, status: MemberStatus | null) {
  const acute = (status?.points ?? 0) >= MEMBERSHIP.tiers[0].minPoints;
  return Math.floor(paidTHB / 100) * (acute ? MEMBERSHIP.acutePointsPer100 : MEMBERSHIP.pointsPer100);
}
