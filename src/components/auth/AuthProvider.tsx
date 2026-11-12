"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/types/auth";

const AuthContext = createContext<SessionUser | null>(null);

/**
 * Exposes the server-resolved user to client components (Navbar, ProductCard, cart).
 * UI gating only — every protected action re-checks the user on the server.
 */
export function AuthProvider({ user, children }: { user: SessionUser | null; children: React.ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useUser() {
  return useContext(AuthContext);
}
