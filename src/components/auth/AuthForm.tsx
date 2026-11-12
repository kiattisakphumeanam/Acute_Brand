"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/app/actions/auth";

const inputClass =
  "mt-2 w-full rounded-full border border-acute-line bg-acute-cream-light px-5 py-3 text-sm normal-case tracking-normal outline-none transition-colors focus:border-acute-ink";

export function AuthForm({
  mode,
  next,
  defaultEmail,
}: {
  mode: "login" | "signup";
  next: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(mode === "login" ? signIn : signUp, undefined);
  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="w-full max-w-sm">
      <p className="eyebrow">{mode === "login" ? "Welcome back" : "Join ACUTE"}</p>
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>

      <form action={action} className="mt-10 space-y-5">
        <input type="hidden" name="next" value={next} />
        {mode === "signup" && (
          <label className="block text-xs uppercase tracking-[0.2em]">
            Full name
            <input name="full_name" required autoComplete="name" className={inputClass} />
          </label>
        )}
        <label className="block text-xs uppercase tracking-[0.2em]">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={defaultEmail}
            className={inputClass}
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.2em]">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={inputClass}
          />
        </label>

        {state?.error && (
          <p role="alert" className="text-sm text-acute-red">
            {state.error}
          </p>
        )}
        {state?.message && <p className="text-sm text-acute-ink/70">{state.message}</p>}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-sm text-acute-ink/60">
        {mode === "login" ? "New to ACUTE? " : "Already have an account? "}
        <Link
          href={`${mode === "login" ? "/signup" : "/login"}${nextQuery}`}
          className="text-acute-ink underline underline-offset-4 hover:text-acute-red"
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
