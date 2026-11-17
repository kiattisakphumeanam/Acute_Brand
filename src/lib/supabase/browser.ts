import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Anon client for the browser. Only used to send files to a signed upload URL that a
 * Server Action created after checking the user is an admin — the URL is the permission.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  client ??= createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}

/** Sends a file to a signed upload URL in the site-media bucket. Returns an error message, or null when it worked. */
export async function uploadToSiteMedia(path: string, token: string, file: File): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return "Supabase isn't configured.";
  const { error } = await supabase.storage
    .from("site-media")
    .uploadToSignedUrl(path, token, file, { contentType: file.type, cacheControl: "31536000" });
  return error?.message ?? null;
}
