import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { MockSupabaseClient } from "@/lib/mock-db";

/**
 * Creates an admin/service-role Supabase client for backend operations
 * that require bypassing Row Level Security (RLS).
 * Falls back seamlessly to in-memory MockSupabaseClient if credentials are placeholder.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("placeholder")) {
    return new MockSupabaseClient() as unknown as SupabaseClient;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

