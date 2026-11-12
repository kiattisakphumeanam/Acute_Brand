"use client";

import { useActionState, useRef, useTransition } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { moveProductImage, removeProductImage, uploadProductImages } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  /** Uploaded to Supabase Storage — can be reordered and deleted here. */
  images: string[];
  /** Found in public/products/<slug>/ — shown after the uploaded ones, managed in the folder. */
  local: string[];
}

export function ImageManager({ productId, images, local }: Props) {
  const [state, upload, uploading] = useActionState(uploadProductImages.bind(null, productId), undefined);
  const [busy, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const run = (fn: () => Promise<void>) => startTransition(fn);
  const all = [...images.map((src) => ({ src, local: false })), ...local.map((src) => ({ src, local: true }))];

  return (
    <div>
      <form action={upload}>
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-acute-line bg-acute-cream-light px-6 py-10 text-center transition-colors hover:border-acute-red",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-acute-red" />
          ) : (
            <ImagePlus className="h-6 w-6 text-acute-red" strokeWidth={1.5} />
          )}
          <span className="text-[12px] font-semibold uppercase tracking-[0.2em]">
            {uploading ? "Uploading…" : "Choose photos to upload"}
          </span>
          <span className="text-xs text-acute-ink/50">JPG, PNG, WebP · up to 5 MB each · several at once</span>
          <input
            ref={inputRef}
            type="file"
            name="files"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            // Upload straight away — no second button to press
            onChange={(e) => e.currentTarget.files?.length && e.currentTarget.form?.requestSubmit()}
          />
        </label>
      </form>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-acute-red">
          {state.error}
        </p>
      )}
      {state?.message && <p className="mt-3 text-sm text-acute-ink/70">{state.message}</p>}

      {all.length > 0 && (
        <ol className={cn("mt-6 grid grid-cols-2 gap-4 tab:grid-cols-3 desk:grid-cols-4", busy && "opacity-60")}>
          {all.map(({ src, local: isLocal }, i) => (
            <li key={src} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-acute-sand">
                <Image src={src} alt="" fill sizes="240px" className="object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-acute-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-acute-cream">
                  {i === 0 ? "Cover" : i === 1 ? "Hover" : `#${i + 1}`}
                </span>
              </div>
              {isLocal ? (
                <p className="mt-2 text-[11px] leading-snug text-acute-ink/50">From the public/products folder</p>
              ) : (
                <div className="mt-2 flex items-center gap-1">
                  <button
                    type="button"
                    disabled={busy || i === 0}
                    onClick={() => run(() => moveProductImage(productId, i, i - 1))}
                    aria-label="Move earlier"
                    className="rounded-full border border-acute-line p-2 hover:border-acute-ink disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={busy || i === images.length - 1}
                    onClick={() => run(() => moveProductImage(productId, i, i + 1))}
                    aria-label="Move later"
                    className="rounded-full border border-acute-line p-2 hover:border-acute-ink disabled:opacity-30"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => confirm("Delete this photo?") && run(() => removeProductImage(productId, src))}
                    aria-label="Delete photo"
                    className="ml-auto rounded-full border border-acute-line p-2 text-acute-red hover:border-acute-red disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
