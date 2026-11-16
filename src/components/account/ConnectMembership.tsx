"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cancelMembership, connectMembership } from "@/app/actions/membership";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 w-full rounded-full border border-acute-line bg-acute-cream-light px-5 py-3 text-sm normal-case tracking-normal outline-none transition-colors focus:border-acute-ink disabled:text-acute-ink/50";
const labelClass = "block text-xs uppercase tracking-[0.2em]";

interface Props {
  email: string;
  fullName: string | null;
  phone: string | null;
  /** yyyy-mm-dd */
  birthday: string | null;
  connected: boolean;
  /** Opened straight away when arriving from the membership page's "Join us" */
  autoOpen?: boolean;
}

/** Button plus popup form that connects (or edits) the signed-in account's membership. Members can cancel from it too. */
export function ConnectMembership({ email, fullName, phone, birthday, connected, autoOpen = false }: Props) {
  const [open, setOpen] = useState(autoOpen && !connected);
  // Cancelling is a second step inside the same popup, so it's never one click away from the page
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [state, action, pending] = useActionState(connectMembership, undefined);
  const [cancelState, cancelAction, cancelling] = useActionState(cancelMembership, undefined);
  const trigger = useRef<HTMLButtonElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const openPopup = () => {
    setConfirmingCancel(false);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  // Saved or cancelled — the page re-renders with the new details behind the popup
  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);
  useEffect(() => {
    if (cancelState?.ok) setOpen(false);
  }, [cancelState]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button ref={trigger} onClick={openPopup} className={connected ? "btn-outline py-3" : "btn-primary"}>
        {connected ? "Edit details" : "Connect membership"}
      </button>

      <div className={cn("fixed inset-0 z-[70] flex items-center justify-center p-4", !open && "pointer-events-none")} inert={!open}>
        <div
          onClick={close}
          className={cn("absolute inset-0 bg-acute-ink/45 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
        />
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-title"
            className="relative max-h-full w-full max-w-[28rem] animate-fade-up overflow-y-auto overscroll-contain rounded-card bg-acute-cream p-6 tab:p-8"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="hex absolute right-4 top-4 flex h-10 w-11 items-center justify-center bg-acute-blue transition-colors hover:bg-acute-red hover:text-acute-cream"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <p className="eyebrow">ACUTE Membership</p>
            <h2 id="connect-title" className="heading-section mt-3 pr-12">
              {confirmingCancel ? "Cancel membership?" : connected ? "Your details" : "Connect membership"}
            </h2>

            {confirmingCancel ? (
              <div className="mt-6">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-acute-ink/70">
                  <li>Member pricing stops from your next order.</li>
                  <li>Your phone number and birthday are deleted.</li>
                  <li>Your member number and points are kept, should you rejoin.</li>
                </ul>

                {cancelState?.error && (
                  <p role="alert" className="mt-5 text-sm text-acute-red">
                    {cancelState.error}
                  </p>
                )}

                {/* Keeping is the primary action; leaving is offered plainly, not pushed */}
                <form action={cancelAction} className="mt-8 grid gap-3">
                  <button type="button" autoFocus onClick={() => setConfirmingCancel(false)} className="btn-primary w-full">
                    Keep membership
                  </button>
                  <button type="submit" disabled={cancelling} className="btn-outline w-full">
                    {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                    Cancel membership
                  </button>
                </form>
              </div>
            ) : (
              <form action={action} className="mt-8 space-y-5">
                <label className={labelClass}>
                  Full name
                  <input name="full_name" required autoFocus autoComplete="name" defaultValue={fullName ?? ""} className={inputClass} />
                </label>
                <label className={labelClass}>
                  Birthday
                  <input name="birthday" type="date" required max={today} defaultValue={birthday ?? ""} className={inputClass} />
                </label>
                <label className={labelClass}>
                  Phone number
                  <input name="phone" type="tel" required autoComplete="tel" defaultValue={phone ?? ""} className={inputClass} />
                </label>
                <label className={labelClass}>
                  Email
                  {/* The account's sign-in email — shown for reference, not editable here */}
                  <input type="email" value={email} disabled readOnly className={inputClass} />
                </label>

                {state?.error && (
                  <p role="alert" className="text-sm text-acute-red">
                    {state.error}
                  </p>
                )}

                <button type="submit" disabled={pending} className="btn-primary w-full">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {connected ? "Save details" : "Connect membership"}
                </button>

                {connected && (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="mx-auto block text-xs text-acute-ink/60 underline underline-offset-4 transition-colors hover:text-acute-ink"
                  >
                    Cancel membership
                  </button>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
