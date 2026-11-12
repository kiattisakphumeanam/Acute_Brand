"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/admin";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete "${name}" and its uploaded photos? This can't be undone.\n\nTo take it off the shop for now, use Hide instead.`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
      className="btn inline-flex border border-acute-red text-acute-red hover:bg-acute-red hover:text-acute-cream"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete product
    </button>
  );
}
