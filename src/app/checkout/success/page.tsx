import Link from "next/link";
import { ClearCart } from "./ClearCart";

export const metadata = { title: "Thank you | ACUTE" };

type Props = { searchParams: Promise<{ preview?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  // ?preview=1 comes from the /checkout mockup: nothing was paid, so the bag stays
  const preview = (await searchParams).preview === "1";

  return (
    <section className="container-acute flex min-h-[70vh] flex-col items-center justify-center py-12 text-center desk:py-16">
      {!preview && <ClearCart />}
      <p className="eyebrow">Order confirmed</p>
      <h1 className="heading-section mt-6">Thank you</h1>
      <p className="mt-6 max-w-md leading-relaxed text-acute-ink/70">
        Your pieces are being prepared with care. A confirmation is on its way to your inbox.
      </p>
      {preview && (
        <p className="mt-4 text-xs text-acute-ink-light">Preview only. No payment was taken and your bag is unchanged.</p>
      )}
      <Link href="/#shop" className="btn-primary mt-10">
        Continue shopping
      </Link>
    </section>
  );
}
