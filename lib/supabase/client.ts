import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { requireSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, publishableKey } = requireSupabaseEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
