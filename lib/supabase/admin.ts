import { createClient } from "@supabase/supabase-js";

/**
 * Server-only. Use for actions that need to bypass RLS (e.g. signup flow, email_logs insert).
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client");
  return createClient(url, key);
}
