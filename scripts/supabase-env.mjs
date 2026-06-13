/**
 * Normalizes Supabase API keys from dashboard formats into values the JS client accepts.
 */
export function normalizeSupabaseKey(key) {
  const trimmed = key.trim();

  if (trimmed.startsWith("sb_publishable_")) {
    return trimmed;
  }

  if (trimmed.startsWith("sb_service_role_")) {
    return trimmed.slice("sb_service_role_".length);
  }

  return trimmed;
}

export function resolveServiceRoleKey() {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!raw) {
    return null;
  }

  return normalizeSupabaseKey(raw);
}

export function resolveSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? null;
}

export function invalidServiceRoleKeyMessage() {
  return [
    "Invalid service role key.",
    "Copy the service_role key from Supabase Dashboard → Settings → API.",
    "Paste it into .env.local as SUPABASE_SERVICE_ROLE_KEY (JWT or sb_service_role_ format).",
    "Never commit this key or use it in client-side code.",
  ].join(" ");
}
