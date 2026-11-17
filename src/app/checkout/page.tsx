import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Checkout | ACUTE" };

export default async function CheckoutPage() {
  // Only signed-in shoppers have a bag; checkout re-checks this server-side too
  const user = await requireUser("/checkout");
  return <CheckoutForm email={user.email} fullName={user.fullName} />;
}
