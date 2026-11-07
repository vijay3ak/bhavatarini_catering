import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Server-only privileged Supabase client using the service-role key.
 * Bypasses Row Level Security (RLS).
 *
 * CRITICAL SECURITY ENFORCEMENT:
 * 1. Protected at compile time by `import "server-only"`. Any import inside
 *    a Client Component ("use client") causes an immediate Next.js build failure.
 * 2. Used exclusively for server-side atomic operations:
 *    - Validated public enquiry insertion via /api/enquiries
 *    - Asynchronous notification outbox background worker processing
 *    - System compliance audit logging
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
