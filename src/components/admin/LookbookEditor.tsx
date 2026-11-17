"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { addLook, deleteLook, moveLook, prepareLookUpload, replaceLookPhoto, updateLook } from "@/app/actions/site-media";
import type { LookbookLook } from "@/lib/site-media";
import { uploadToSiteMedia } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 w-full rounded-full border border-acute-line bg-acute-cream-light px-5 py-3 text-sm normal-case tracking-normal outline-none transition-colors focus:border-acute-ink";
const labelClass = "block text-xs uppercase tracking-[0.2em]";
const iconButton = "rounded-full border border-acute-line p-2 hover:border-acute-ink disabled:opacity-30";
const PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/avif";

type Status = { error?: string; message?: string };

/** Signed upload, then `save(path)`. Returns what to show the admin. */
async function uploadLook(file: File, save: (path: string) => Promise<Status | undefined>): Promise<Status> {
  const prepared = await prepareLookUpload(file.type, file.size);
  if ("error" in prepared) return prepared;
  const error = await uploadToSiteMedia(prepared.path, prepared.token, file);
  if (error) return { error };
  return (await save(prepared.path)) ?? {};
}

function FilePicker({ label, busy, multiple, onFiles }: { label: string; busy: boolean; multiple?: boolean; onFiles: (files: File[]) => void }) {
  return (
    <label
      className={cn(
        "btn-outline cursor-pointer px-5 py-2.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-acute-red",
        busy && "pointer-events-none opacity-60",
      )}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {busy ? "Uploading…" : label}
      <input
        type="file"
        accept={PHOTO_TYPES}
        multiple={multiple}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.currentTarget.files ?? [])];
          e.currentTarget.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </label>
  );
}

function LookRow({ look, index, total }: { look: LookbookLook; index: number; total: number }) {
  const router = useRouter();
  const [state, action, saving] = useActionState(updateLook.bind(null, look.id), undefined);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({});
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setStatus({ error: (err as Error).message });
      }
      router.refresh();
    });

  const replace = async ([file]: File[]) => {
    setBusy(true);
    setStatus(await uploadLook(file, (path) => replaceLookPhoto(look.id, path)).catch(() => ({ error: "Upload failed." })));
    setBusy(false);
    router.refresh();
  };

  const feedback = state?.error ?? status.error ?? state?.message ?? status.message;

  return (
    <li className={cn("grid gap-5 py-8 tab:grid-cols-[12rem_minmax(0,1fr)] tab:gap-8", pending && "opacity-60")}>
      <div className="w-40 tab:w-full">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[0.75rem_0.75rem_0_0.75rem] bg-acute-sand">
          <Image src={look.url} alt="" fill sizes="240px" className="object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-acute-ink/80 px-2.5 py-1 text-[length:max(0.625rem,10px)] font-semibold uppercase tracking-[0.16em] text-acute-cream">
            #{index + 1}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1">
          <button type="button" disabled={pending || index === 0} onClick={() => run(() => moveLook(look.id, -1))} aria-label="Move earlier" className={iconButton}>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" disabled={pending || index === total - 1} onClick={() => run(() => moveLook(look.id, 1))} aria-label="Move later" className={iconButton}>
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => confirm("Delete this photo from the lookbook?") && run(() => deleteLook(look.id))}
            aria-label="Delete photo"
            className={cn(iconButton, "ml-auto text-acute-red hover:border-acute-red")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <form action={action} className="grid content-start gap-4 tab:grid-cols-2">
        <label className={labelClass}>
          Caption (English)
          <input name="caption_en" defaultValue={look.caption_en} maxLength={200} placeholder="07:40 Commute" className={inputClass} />
        </label>
        <label className={labelClass}>
          Caption (Thai)
          <input name="caption_th" defaultValue={look.caption_th} maxLength={200} lang="th" className={inputClass} />
        </label>
        <label className={labelClass}>
          Description (English)
          <input name="alt_en" defaultValue={look.alt_en} maxLength={200} className={inputClass} />
        </label>
        <label className={labelClass}>
          Description (Thai)
          <input name="alt_th" defaultValue={look.alt_th} maxLength={200} lang="th" className={inputClass} />
        </label>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 tab:col-span-2">
          <button type="submit" disabled={saving} className="btn-outline px-5 py-2.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </button>
          <FilePicker label="Replace photo" busy={busy} onFiles={replace} />
          <span
            role={state?.error || status.error ? "alert" : "status"}
            className={cn("text-xs", state?.error || status.error ? "text-acute-red" : "text-acute-ink/60")}
          >
            {feedback ?? "Caption shows on the photo. Description is read aloud by screen readers."}
          </span>
        </div>
      </form>
    </li>
  );
}

/** The /about lookbook: add photos, caption them, reorder, remove. Empty shows the placeholders. */
export function LookbookEditor({ looks }: { looks: LookbookLook[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({});

  // One after another, so the order they were picked in is the order they appear
  const add = async (files: File[]) => {
    setBusy(true);
    setStatus({});
    let added = 0;
    for (const file of files) {
      const result = await uploadLook(file, addLook).catch(() => ({ error: "Upload failed." }) as Status);
      if (result.error) {
        setStatus({ error: `${file.name}: ${result.error}` });
        break;
      }
      added++;
    }
    if (added) setStatus((s) => (s.error ? s : { message: `Added ${added} photo${added === 1 ? "" : "s"}. Write a caption for each.` }));
    setBusy(false);
    router.refresh();
  };

  return (
    <>
      {looks.length > 0 && (
        <ol className="divide-y divide-acute-line">
          {looks.map((look, i) => (
            <LookRow key={`${look.id}-${look.url}`} look={look} index={i} total={looks.length} />
          ))}
        </ol>
      )}
      <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-3 py-8", looks.length > 0 && "border-t border-acute-line")}>
        <FilePicker label="Add photos" busy={busy} multiple onFiles={add} />
        <p className="max-w-prose text-sm text-acute-ink/60">
          {status.error ? (
            <span role="alert" className="text-acute-red">{status.error}</span>
          ) : (
            (status.message ??
              (looks.length
                ? "Portrait 3:4, at least 1200 px wide. Up to 12 photos; three per row on the site."
                : "Empty: the page shows three placeholders. Portrait 3:4, at least 1200 px wide, up to 12."))
          )}
        </p>
      </div>
    </>
  );
}
