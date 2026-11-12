import Link from "next/link";
import { ClearCart } from "./ClearCart";

export const metadata = { title: "Thank you — ACUTE" };

export default function CheckoutSuccessPage() {
  return (
    <section className="container-acute flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
      <ClearCart />
      <p className="eyebrow">Order confirmed</p>
      <h1 className="heading-display mt-6 text-5xl sm:text-6xl">Thank you</h1>
      <p className="mt-6 max-w-md leading-relaxed text-acute-ink/70">
        Your pieces are being prepared with care. A confirmation is on its way to your inbox.
      </p>
      <Link href="/#shop" className="btn-primary mt-10">
        Continue shopping
      </Link>
    </section>
  );
}
