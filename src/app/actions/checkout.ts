"use server";

import { headers } from "next/headers";
import type Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { memberDiscount } from "@/lib/membership";
import { getMemberStatus } from "@/lib/membership-server";
import { getProductsByIds } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export type CheckoutItem = { id: string; quantity: number; size?: string };
export type CheckoutResult = { url: string } | { error: string };

const MAX_QTY_PER_ITEM = 10;

export async function createCheckoutSession(items: CheckoutItem[]): Promise<CheckoutResult> {
  if (!items.length) return { error: "Your bag is empty." };

  // Public visitors can browse but not buy — enforced here, not just in the UI.
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to check out." };

  const stripe = getStripe();
  if (!stripe) {
    return { error: "Checkout isn't configured yet. Add STRIPE_SECRET_KEY to .env.local." };
  }

  try {
    // Re-read prices from the database; the client only tells us *what* and *how many*.
    const products = await getProductsByIds(items.map((i) => i.id));
    const byId = new Map(products.map((p) => [p.id, p]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0; // THB, from database prices
    for (const item of items) {
      const product = byId.get(item.id);
      if (!product) return { error: "An item in your bag is no longer available." };

      const quantity = Math.min(Math.max(Math.trunc(item.quantity), 1), MAX_QTY_PER_ITEM);
      // Size is a display label only; accept it only if the product offers it
      const size = item.size && product.sizes?.includes(item.size) ? item.size : undefined;
      subtotal += product.price * quantity;
      lineItems.push({
        quantity,
        price_data: {
          currency: "thb",
          unit_amount: product.price * 100, // THB → satang
          product_data: {
            name: size ? `${product.name}, size ${size}` : product.name,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
            metadata: { product_id: product.id }, // read back in the webhook
          },
        },
      });
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "http://localhost:3000";

    // Same rule the bag shows (src/lib/membership.ts), worked out again here from server data.
    // A single-use coupon carries it, so Stripe's receipt lists the discount on its own line.
    const discount = memberDiscount(subtotal, await getMemberStatus(user.id));
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (discount && discount.amount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discount.amount * 100, // THB → satang
        currency: "thb",
        duration: "once",
        max_redemptions: 1,
        name:
          discount.kind === "first_order"
            ? `New member ${discount.rate * 100}%`
            : `${discount.tier} member ${discount.rate * 100}%`,
        metadata: { user_id: user.id },
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      discounts,
      customer_email: user.email,
      client_reference_id: user.id, // links the order to the user in the webhook
      shipping_address_collection: { allowed_countries: ["TH"] },
      // Payment methods (cards, PromptPay, etc.) come from your Stripe Dashboard settings.
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#shop`,
    });

    if (!session.url) return { error: "Could not start checkout. Please try again." };
    return { url: session.url };
  } catch (err) {
    console.error("[checkout]", err);
    return { error: "Something went wrong starting checkout. Please try again." };
  }
}
