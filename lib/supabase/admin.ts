import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

function resolveServiceRoleKey(): string | undefined {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!raw) {
    return undefined;
  }

  if (raw.startsWith("sb_service_role_")) {
    return raw.slice("sb_service_role_".length);
  }

  return raw;
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = resolveServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin user management.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
