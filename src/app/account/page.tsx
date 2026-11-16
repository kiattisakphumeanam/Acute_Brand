import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ConnectMembership } from "@/components/account/ConnectMembership";
import { ProductImage } from "@/components/product/ProductImage";
import { requireUser } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn, formatTHB } from "@/lib/utils";

export const metadata = { title: "Your account | ACUTE" };

type OrderRow = {
  id: string;
  created_at: string;
  amount_total: number;
  status: string;
  order_items: { name: string; quantity: number }[];
};

type Profile = {
  full_name: string | null;
  phone: string | null;
  birthday: string | null;
  member_since: string | null;
  member_cancelled_at: string | null;
  customer_id: string | null;
};

type Props = { searchParams: Promise<{ connect?: string; tab?: string }> };

const tabClass = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-5 py-[0.625rem] text-[length:max(0.75rem,10px)] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-soft",
    active
      ? "border-acute-red bg-acute-red text-acute-cream"
      : "border-acute-line bg-acute-cream-light text-acute-ink hover:border-acute-ink",
  );

export default async function AccountPage({ searchParams }: Props) {
  // ?connect=1 comes from the membership page's "Join us" — kept through sign-in so the popup opens after
  const params = await searchParams;
  const connect = params.connect === "1";
  const tab = params.tab === "orders" ? "orders" : "account";
  const user = await requireUser(connect ? "/account?connect=1" : "/account");

  // RLS returns only this user's orders.
  const supabase = await createSupabaseServerClient();
  const { data } = (await supabase
    ?.from("orders")
    .select("id, created_at, amount_total, status, order_items(name, quantity)")
    .order("created_at", { ascending: false })) ?? { data: null };
  const orders = (data ?? []) as OrderRow[];
  // A few photographed pieces to fill the empty Orders tab
  const picks =
    tab === "orders" && orders.length === 0
      ? (await getProducts()).filter((p) => p.image_url && (p.status ?? "active") === "active").slice(0, 4)
      : [];

  // Null until supabase/schema.sql's membership columns exist
  const { data: profile } = ((await supabase
    ?.from("profiles")
    .select("full_name, phone, birthday, member_since, member_cancelled_at, customer_id")
    .eq("id", user.id)
    .single()) ?? { data: null }) as { data: Profile | null };
  const connected = Boolean(profile?.member_since) && !profile?.member_cancelled_at;
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" });

  return (
    <section className="container-acute pb-12 pt-10 tab:pt-12 desk:pb-16 desk:pt-14">
      <div className="flex flex-col justify-between gap-6 tab:flex-row tab:items-end">
        <div>
          <p className="eyebrow">{user.role === "admin" ? "Admin account" : "Your account"}</p>
          <h1 className="heading-section mt-3">Hello{user.fullName ? `, ${user.fullName}` : ""}</h1>
          <p className="mt-3 text-sm text-acute-ink/60">{user.email}</p>
        </div>
        {/* Kept quiet so it isn't hit by accident */}
        <form action={signOut}>
          <button className="text-xs text-acute-ink/60 underline underline-offset-4 transition-colors hover:text-acute-ink">
            Sign out
          </button>
        </form>
      </div>

      {/* Two views of one page — plain links, so each has its own URL and the back button works */}
      <nav aria-label="Account sections" className="mt-10 flex gap-2 border-b border-acute-line pb-6">
        <Link
          href="/account"
          scroll={false}
          aria-current={tab === "account" ? "page" : undefined}
          className={tabClass(tab === "account")}
        >
          Account
        </Link>
        <Link
          href="/account?tab=orders"
          scroll={false}
          aria-current={tab === "orders" ? "page" : undefined}
          className={tabClass(tab === "orders")}
        >
          Orders
          <span className={cn("ml-1.5", tab === "orders" ? "text-acute-cream/70" : "text-acute-stone")}>
            {orders.length}
          </span>
        </Link>
      </nav>

      {tab === "account" ? (
        <section
          id="membership"
          className="mt-8 rounded-card border border-acute-line bg-acute-cream-light p-6 tab:p-8"
        >
          <div className="flex flex-col justify-between gap-6 tab:flex-row tab:items-start">
            <div>
              <p className="eyebrow">ACUTE Membership</p>
              <h2 className="mt-3 font-serif text-2xl uppercase tracking-tight">
                {connected ? "You're a member" : "Connect membership"}
              </h2>
              {connected && profile ? (
                <dl className="mt-5 grid gap-x-10 gap-y-3 text-sm tab:grid-cols-[auto_1fr]">
                  {profile.customer_id && (
                    <>
                      <dt className="text-acute-ink/60">Member no.</dt>
                      <dd className="uppercase tracking-[0.1em]">{profile.customer_id}</dd>
                    </>
                  )}
                  <dt className="text-acute-ink/60">Member since</dt>
                  <dd>{formatDate(profile.member_since!)}</dd>
                  {profile.birthday && (
                    <>
                      <dt className="text-acute-ink/60">Birthday</dt>
                      <dd>{formatDate(profile.birthday)}</dd>
                    </>
                  )}
                  {profile.phone && (
                    <>
                      <dt className="text-acute-ink/60">Phone</dt>
                      <dd>{profile.phone}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-acute-ink/70">
                  {profile?.member_cancelled_at
                    ? `You left on ${formatDate(profile.member_cancelled_at)}. Welcome back any time: rejoin to keep your member number${profile.customer_id ? ` (${profile.customer_id})` : ""} and your points.`
                    : "Add your birthday and phone number to start collecting points, from Morning Tea up to ACUTE."}{" "}
                  <Link href="/membership" className="underline underline-offset-4 hover:text-acute-red">
                    About membership
                  </Link>
                </p>
              )}
            </div>
            <ConnectMembership
              email={user.email}
              fullName={profile?.full_name ?? user.fullName}
              phone={profile?.phone ?? null}
              birthday={profile?.birthday ?? null}
              connected={connected}
              autoOpen={connect}
            />
          </div>
        </section>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-card border border-acute-line bg-acute-cream-light px-6 py-10 text-center tab:px-8 tab:py-12">
          <p className="eyebrow">No orders yet</p>
          <h2 className="mt-3 font-serif text-2xl uppercase tracking-tight">Ready to shop?</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-acute-ink/70">
            Your orders will appear here once you&apos;ve placed one.
          </p>
          <Link href="/products" className="btn-primary mt-7">
            Start shopping
          </Link>
          {picks.length > 0 && (
            <ul className="mx-auto mt-10 grid max-w-md grid-cols-4 gap-2 tab:gap-3">
              {picks.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="block aspect-[4/5] overflow-hidden rounded-[0.75rem] transition-opacity hover:opacity-80"
                  >
                    <ProductImage src={p.image_url} alt={p.name} category={p.category} sizes="112px" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-acute-stone/40 border-y border-acute-stone/40">
          {orders.map((order) => (
            <li key={order.id} className="grid gap-2 py-5 text-sm tab:grid-cols-4 tab:items-center">
              <span className="text-acute-ink/60">
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  dateStyle: "medium",
                })}
              </span>
              <span className="tab:col-span-2">
                {order.order_items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </span>
              <span className="flex justify-between tab:justify-end tab:gap-6">
                <span className="eyebrow">{order.status}</span>
                <span className="tabular-nums">{formatTHB(order.amount_total / 100)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
