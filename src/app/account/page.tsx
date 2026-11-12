import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatTHB } from "@/lib/utils";

export const metadata = { title: "Your account — ACUTE" };

type OrderRow = {
  id: string;
  created_at: string;
  amount_total: number;
  status: string;
  order_items: { name: string; quantity: number }[];
};

export default async function AccountPage() {
  const user = await requireUser("/account");

  // RLS returns only this user's orders.
  const supabase = await createSupabaseServerClient();
  const { data } = (await supabase
    ?.from("orders")
    .select("id, created_at, amount_total, status, order_items(name, quantity)")
    .order("created_at", { ascending: false })) ?? { data: null };
  const orders = (data ?? []) as OrderRow[];

  return (
    <section className="container-acute py-32">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{user.role === "admin" ? "Admin account" : "Your account"}</p>
          <h1 className="heading-display mt-4 text-4xl sm:text-5xl">
            Hello{user.fullName ? `, ${user.fullName}` : ""}
          </h1>
          <p className="mt-3 text-sm text-acute-ink/60">{user.email}</p>
        </div>
        <form action={signOut}>
          <button className="btn-outline py-3">Sign out</button>
        </form>
      </div>

      <h2 className="mt-20 font-serif text-2xl uppercase tracking-tight">Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-acute-ink/60">
          No orders yet.{" "}
          <Link href="/#shop" className="underline underline-offset-4 hover:text-acute-red">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-acute-stone/40 border-y border-acute-stone/40">
          {orders.map((order) => (
            <li key={order.id} className="grid gap-2 py-5 text-sm sm:grid-cols-4 sm:items-center">
              <span className="text-acute-ink/60">
                {new Date(order.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
              </span>
              <span className="sm:col-span-2">
                {order.order_items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </span>
              <span className="flex justify-between sm:justify-end sm:gap-6">
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
