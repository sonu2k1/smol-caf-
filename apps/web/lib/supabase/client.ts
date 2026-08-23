import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@smol-cafe/db";

/**
 * Creates a typed Supabase client for use in Client Components (browser-side).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
