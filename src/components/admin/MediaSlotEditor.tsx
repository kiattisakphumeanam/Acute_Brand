"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { clearMedia, prepareMediaUpload, saveMediaAlt, saveMediaUpload } from "@/app/actions/site-media";
import { acceptFor, type MediaSlot, type MediaVariant } from "@/data/site-media";
import type { SiteMedia } from "@/lib/site-media";
import { uploadToSiteMedia } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 w-full rounded-full border border-acute-line bg-acute-cream-light px-5 py-3 text-sm normal-case tracking-normal outline-none transition-colors focus:border-acute-ink";
const labelClass = "block text-xs uppercase tracking-[0.2em]";
const smallCaps = "text-[length:max(0.6875rem,10px)] font-semibold uppercase tracking-[0.2em]";

interface Props {
  slot: MediaSlot;
  /** Uploaded in /admin/media, or null while the slot uses its fallback */
  media: SiteMedia | null;
  /** The file in public/ the site shows until something is uploaded */
  fallback: { kind: "image" | "video"; url: string } | null;
}

function Preview({ kind, url, poster, className }: { kind: "image" | "video"; url: string; poster?: string | null; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[0.75rem_0.75rem_0_0.75rem] bg-acute-sand", className)}>
      {kind === "video" ? (
        <video src={url} poster={poster ?? undefined} muted playsInline controls preload="metadata" className="h-full w-full object-cover" />
      ) : (
        <Image src={url} alt="" fill sizes="240px" className="object-cover" />
      )}
    </div>
  );
}

/** One place on the site: what shows there now, and the controls to change it. */
export function MediaSlotEditor({ slot, media, fallback }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<MediaVariant | null>(null);
  const [status, setStatus] = useState<{ error?: string; message?: string }>({});
  const [, startTransition] = useTransition();
  const [altState, altAction, savingAlt] = useActionState(saveMediaAlt.bind(null, slot.key), undefined);

  const upload = async (variant: MediaVariant, file: File) => {
    setBusy(variant);
    setStatus({});
    try {
      const prepared = await prepareMediaUpload(slot.key, variant, file.type, file.size);
      if ("error" in prepared) return setStatus(prepared);

      const error = await uploadToSiteMedia(prepared.path, prepared.token, file);
      if (error) return setStatus({ error });

      setStatus((await saveMediaUpload(slot.key, variant, prepared.path)) ?? {});
      router.refresh();
    } catch {
      setStatus({ error: "Upload failed. Check your connection and try again." });
    } finally {
      setBusy(null);
    }
  };

  const remove = (variant: MediaVariant, question: string) => {
    if (!confirm(question)) return;
    setBusy(variant);
    startTransition(async () => {
      setStatus((await clearMedia(slot.key, variant)) ?? {});
      setBusy(null);
      router.refresh();
    });
  };

  const current = media ? { kind: media.kind, url: media.url } : fallback;

  // A labelled file picker; choosing a file uploads it straight away
  const picker = (variant: MediaVariant, label: string) => (
    <label
      className={cn(
        "btn-outline cursor-pointer px-5 py-2.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-acute-red",
        busy && "pointer-events-none opacity-60",
      )}
    >
      {busy === variant ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {busy === variant ? "Uploading…" : label}
      <input
        type="file"
        accept={acceptFor(slot, variant, media?.kind)}
        className="sr-only"
        disabled={!!busy}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (file) upload(variant, file);
        }}
      />
    </label>
  );

  const removeButton = (variant: MediaVariant, label: string, question: string) => (
    <button
      type="button"
      disabled={!!busy}
      onClick={() => remove(variant, question)}
      className={cn(smallCaps, "inline-flex items-center gap-1.5 text-acute-red underline-offset-4 hover:underline disabled:opacity-40")}
    >
      <Trash2 className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <li className="grid gap-5 py-8 tab:grid-cols-[12rem_minmax(0,1fr)] tab:gap-8">
      <div className="w-40 tab:w-full">
        {current ? (
          <Preview kind={current.kind} url={current.url} poster={media?.poster_url} className="aspect-[4/5]" />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center rounded-[0.75rem_0.75rem_0_0.75rem] border border-dashed border-acute-line px-4 text-center text-xs text-acute-ink/50">
            Empty. The site shows a placeholder.
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="font-serif text-xl leading-tight">{slot.label}</h3>
          <span className={cn(smallCaps, media ? "text-acute-red" : "text-acute-ink/50")}>
            {media ? "Uploaded" : fallback ? "Using the built-in file" : "Empty"}
          </span>
        </div>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-acute-ink/60">{slot.hint}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          {picker("main", media ? "Replace" : "Upload")}
          {media && removeButton("main", "Remove", "Remove this file? The site goes back to the built-in one.")}
        </div>

        {/* Extras only once there is a main file to go with them */}
        {media && (slot.mobile || media.kind === "video") && (
          <div className="mt-6 grid gap-5 border-t border-acute-line pt-5 tab:grid-cols-2">
            {slot.mobile && (
              <div>
                <p className={cn(smallCaps, "text-acute-ink")}>Phone version</p>
                <p className="mt-1 text-xs text-acute-ink/60">Portrait cut for screens under 760 px. Optional.</p>
                {media.mobile_url && <Preview kind={media.kind} url={media.mobile_url} className="mt-3 aspect-[9/16] w-24" />}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {picker("mobile", media.mobile_url ? "Replace" : "Upload")}
                  {media.mobile_url && removeButton("mobile", "Remove", "Remove the phone version?")}
                </div>
              </div>
            )}
            {media.kind === "video" && (
              <div>
                <p className={cn(smallCaps, "text-acute-ink")}>Poster</p>
                <p className="mt-1 text-xs text-acute-ink/60">
                  Still shown while the video loads, and to visitors who turn motion off.
                </p>
                {media.poster_url && <Preview kind="image" url={media.poster_url} className="mt-3 aspect-video w-32" />}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {picker("poster", media.poster_url ? "Replace" : "Upload")}
                  {media.poster_url && removeButton("poster", "Remove", "Remove the poster?")}
                </div>
              </div>
            )}
          </div>
        )}

        {media && !slot.decorative && (
          <form action={altAction} className="mt-6 grid gap-4 border-t border-acute-line pt-5 tab:grid-cols-2">
            <label className={labelClass}>
              Description (English)
              <input name="alt_en" defaultValue={media.alt_en} maxLength={200} className={inputClass} />
            </label>
            <label className={labelClass}>
              Description (Thai)
              <input name="alt_th" defaultValue={media.alt_th} maxLength={200} lang="th" className={inputClass} />
            </label>
            <div className="flex flex-wrap items-center gap-4 tab:col-span-2">
              <button type="submit" disabled={savingAlt} className="btn-outline px-5 py-2.5">
                {savingAlt && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save description
              </button>
              <span className="text-xs text-acute-ink/60">
                {altState?.error ? (
                  <span role="alert" className="text-acute-red">{altState.error}</span>
                ) : (
                  altState?.message ?? "Read aloud by screen readers. Describe what's in the picture."
                )}
              </span>
            </div>
          </form>
        )}

        {(status.error || status.message) && (
          <p role={status.error ? "alert" : "status"} className={cn("mt-4 text-sm", status.error ? "text-acute-red" : "text-acute-ink/70")}>
            {status.error ?? status.message}
          </p>
        )}
      </div>
    </li>
  );
}
