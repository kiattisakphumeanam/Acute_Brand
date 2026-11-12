"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/admin";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { CATEGORIES, MOMENTS, type Product } from "@/types/product";

export type AdminProduct = Product & { is_active: boolean; sort_order: number };

const CATEGORY_LABELS = dictionaries.en.categories;

export const inputClass =
  "mt-2 w-full rounded-[14px] border border-acute-line bg-acute-cream-light px-4 py-2.5 text-sm font-light normal-case tracking-normal outline-none transition-colors focus:border-acute-ink";
export const labelClass = "block text-[11px] font-semibold uppercase tracking-[0.2em]";
const hintClass = "font-light normal-case tracking-normal text-acute-ink/50";

/** Add and edit share one form; pass `product` to edit. */
export function ProductForm({ product }: { product?: AdminProduct }) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <label className={labelClass}>
        Name
        <input name="name" required defaultValue={product?.name} className={inputClass} />
      </label>
      <label className={labelClass}>
        Slug <span className={hintClass}>(optional — made from the name; also the photo folder name)</span>
        <input name="slug" defaultValue={product?.slug} className={inputClass} />
      </label>

      <div className="grid gap-4 tab:grid-cols-3">
        <label className={labelClass}>
          Price (THB)
          <input name="price" type="number" min={10} step={1} required defaultValue={product?.price} className={inputClass} />
        </label>
        <label className={labelClass}>
          Category
          <select name="category" required defaultValue={product?.category ?? ""} className={inputClass}>
            <option value="" disabled>
              Choose…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Sort order <span className={hintClass}>(1 = first)</span>
          <input name="sort_order" type="number" step={1} defaultValue={product?.sort_order ?? 0} className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        Description
        <textarea name="description" rows={4} defaultValue={product?.description} className={inputClass} />
      </label>

      <div className="grid gap-4 tab:grid-cols-2">
        <label className={labelClass}>
          Status
          <select name="status" defaultValue={product?.status ?? "active"} className={inputClass}>
            <option value="active">Active — can be bought</option>
            <option value="sold_out">Sold out</option>
            <option value="coming_soon">Coming soon — shows Notify me</option>
          </select>
        </label>
        <label className={labelClass}>
          Moment
          <select name="moment" defaultValue={product?.moment ?? ""} className={inputClass}>
            <option value="">—</option>
            {MOMENTS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Colours <span className={hintClass}>(name + hex, comma separated)</span>
        <input
          name="colors"
          placeholder="White #FBFBF8, Ink #2F3135"
          defaultValue={product?.colors?.map((c) => `${c.name} ${c.hex}`).join(", ")}
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 tab:grid-cols-2">
        <label className={labelClass}>
          Sizes <span className={hintClass}>(empty = no size picker)</span>
          <input name="sizes" placeholder="XS, S, M, L  or  F" defaultValue={product?.sizes?.join(", ")} className={inputClass} />
        </label>
        <label className={labelClass}>
          Sold-out sizes
          <input name="sold_out_sizes" placeholder="XS" defaultValue={product?.sold_out_sizes?.join(", ")} className={inputClass} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="is_new" type="checkbox" defaultChecked={product?.is_new} className="accent-acute-red" /> Show the
        NEW ARRIVAL tag
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-acute-red">
          {state.error}
        </p>
      )}
      {state?.message && <p className="text-sm text-acute-ink/70">{state.message}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full tab:w-auto">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {product ? "Save changes" : "Create product — add photos next"}
      </button>
    </form>
  );
}
