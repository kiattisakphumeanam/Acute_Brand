import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Stripe → Supabase order sync.
 * Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe not configured", { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("[webhook] Signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const supabase = getSupabaseAdmin();
    if (!supabase) return new Response("Supabase not configured", { status: 500 });

    // Upsert on stripe_session_id keeps this idempotent if Stripe retries the event.
    const { data: order, error } = await supabase
      .from("orders")
      .upsert(
        {
          stripe_session_id: session.id,
          user_id: session.client_reference_id,
          email: session.customer_details?.email ?? null,
          amount_total: session.amount_total ?? 0,
          currency: session.currency ?? "thb",
          status: "paid",
          shipping: session.collected_information?.shipping_details ?? null,
        },
        { onConflict: "stripe_session_id" },
      )
      .select("id")
      .single();

    if (error) {
      console.error("[webhook] Order insert failed", error);
      return new Response("Order insert failed", { status: 500 });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    const rows = lineItems.data.map((li) => {
      const product = li.price?.product as Stripe.Product | undefined;
      return {
        order_id: order.id,
        product_id: product?.metadata.product_id ?? null,
        name: li.description,
        unit_amount: li.price?.unit_amount ?? 0,
        quantity: li.quantity ?? 1,
      };
    });

    await supabase.from("order_items").delete().eq("order_id", order.id);
    const { error: itemsError } = await supabase.from("order_items").insert(rows);
    if (itemsError) {
      console.error("[webhook] Order items insert failed", itemsError);
      return new Response("Order items insert failed", { status: 500 });
    }
  }

  return Response.json({ received: true });
}
