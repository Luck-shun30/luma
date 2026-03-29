import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env, hasSupabaseAdminEnv, supabaseServiceKey } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminMaybe() {
  if (!hasSupabaseAdminEnv) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseServiceKey!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return adminClient;
}
