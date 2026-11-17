"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { memberDiscount, pointsFor, type MemberStatus } from "@/lib/membership";
import { usePrice } from "@/lib/ui-store";

/** Subtotal, member discount, points and total. Shared by the bag and /checkout so both show what Stripe charges. */
export function CartTotals({
  subtotal,
  member,
  shipping,
}: {
  subtotal: number;
  member: MemberStatus | null;
  /** THB; the row is left out when undefined (the bag doesn't know the delivery choice yet) */
  shipping?: number;
}) {
  const { t: { cart: t } } = useTranslation();
  const price = usePrice();

  // Same rule checkout applies (src/lib/membership.ts)
  const discount = memberDiscount(subtotal, member);
  const total = subtotal - (discount?.amount ?? 0) + (shipping ?? 0);
  const points = pointsFor(subtotal, member);

  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-acute-ink-light">{t.subtotal}</dt>
        <dd className="tabular-nums">{price(subtotal)}</dd>
      </div>
      {discount && (
        <div className="flex justify-between gap-4 text-acute-red">
          <dt>
            {discount.kind === "first_order"
              ? t.discountFirst(discount.rate * 100)
              : t.discountTier(discount.tier, discount.rate * 100)}
          </dt>
          <dd className="tabular-nums">−{price(discount.amount)}</dd>
        </div>
      )}
      {/* Right under the discount, so members see both perks of this order together */}
      {member?.member && points > 0 && (
        <div className="flex justify-between gap-4 text-acute-red">
          <dt>{t.pointsEarned}</dt>
          <dd className="tabular-nums">{t.pointsValue(points.toLocaleString())}</dd>
        </div>
      )}
      {shipping !== undefined && (
        <div className="flex justify-between gap-4">
          <dt className="text-acute-ink-light">{t.shipping}</dt>
          <dd className="tabular-nums">{shipping ? price(shipping) : t.free}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4 border-t border-acute-line pt-3">
        <dt className="eyebrow">{t.total}</dt>
        <dd className="font-serif text-2xl tabular-nums">{price(total)}</dd>
      </div>
    </dl>
  );
}

const linkClass =
  "shrink-0 text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em] underline-offset-4 hover:text-acute-red hover:underline";

/** Under the totals: members get a link to their perks; everyone else sees what joining would take off this order. */
export function MemberNote({
  subtotal,
  member,
  onNavigate,
}: {
  subtotal: number;
  member: MemberStatus | null;
  /** Closes the bag when a link is followed */
  onNavigate?: () => void;
}) {
  const { t: { cart: t } } = useTranslation();
  const price = usePrice();

  // Null while loading (or without Supabase) — wait, so members never see the join pitch flash first
  if (!member) return null;

  if (member.member) {
    return (
      <p className="mt-3 flex justify-end text-xs">
        <Link href="/membership" onClick={onNavigate} className={`${linkClass} text-acute-ink-light`}>
          {t.memberDetails}
        </Link>
      </p>
    );
  }

  // Their real history with membership switched on, so a rejoining member isn't promised the first-order rate again
  const asMember: MemberStatus = { ...member, member: true };
  const discount = memberDiscount(subtotal, asMember);
  const points = pointsFor(subtotal, asMember);
  const hasPerks = Boolean(discount?.amount) || points > 0;

  return (
    <div className="mt-4 text-xs">
      {hasPerks ? (
        <>
          <p className="text-acute-ink-light">{t.memberPreview}</p>
          <dl className="mt-2 space-y-1">
            {discount && discount.amount > 0 && (
              <div className="flex justify-between gap-4">
                <dt>
                  {discount.kind === "first_order"
                    ? t.discountFirst(discount.rate * 100)
                    : t.discountTier(discount.tier, discount.rate * 100)}
                </dt>
                <dd className="tabular-nums">−{price(discount.amount)}</dd>
              </div>
            )}
            {points > 0 && (
              <div className="flex justify-between gap-4">
                <dt>{t.pointsEarned}</dt>
                <dd className="tabular-nums">{t.pointsValue(points.toLocaleString())}</dd>
              </div>
            )}
          </dl>
        </>
      ) : (
        <p className="text-acute-ink-light">{t.memberGeneric}</p>
      )}
      <p className="mt-3 flex justify-between gap-4">
        {/* Opens the join popup on /account straight away */}
        <Link href="/account?connect=1" onClick={onNavigate} className={`${linkClass} text-acute-red`}>
          {t.joinNow}
        </Link>
        <Link href="/membership" onClick={onNavigate} className={`${linkClass} text-acute-ink-light`}>
          {t.memberDetails}
        </Link>
      </p>
    </div>
  );
}
