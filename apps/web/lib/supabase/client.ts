import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@smol-cafe/db";
import { MockSupabaseClient } from "@/lib/mock-db";

/**
 * Creates a typed Supabase client for use in Client Components (browser-side).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return new MockSupabaseClient() as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

