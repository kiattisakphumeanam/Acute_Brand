import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Lazily created so the app builds and runs without Stripe keys (checkout is simply disabled). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe ??= new Stripe(key);
  return stripe;
}
