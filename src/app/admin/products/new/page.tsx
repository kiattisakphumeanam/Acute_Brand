import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Add product | ACUTE Admin" };

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="max-w-[47.5rem]">
      <Link href="/admin" className="btn-ghost">
        <ArrowLeft className="h-3.5 w-3.5" /> All products
      </Link>
      <h1 className="caps mt-8 text-[2.75rem] tab:text-[3.5rem]">Add product</h1>
      <p className="mt-3 text-sm text-acute-ink/60">Fill in the details first. You&apos;ll add photos on the next page.</p>
      <div className="mt-10">
        <ProductForm />
      </div>
    </div>
  );
}
