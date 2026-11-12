/**
 * Roles stored in public.profiles.role.
 * A visitor who isn't signed in has no profile — that's the "public" tier (browse only).
 */
export type Role = "customer" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

/** Shared shape for useActionState-driven forms. */
export type FormState = { error?: string; message?: string } | undefined;
