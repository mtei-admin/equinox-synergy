const PLACEHOLDER_URL = "your-project-ref";
const PLACEHOLDER_KEYS = new Set([
  "your-anon-key",
  "your-publishable-key",
  "sb_publishable_your-key",
]);

export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export type SupabaseEnvIssue = {
  configured: false;
  message: string;
};

function resolvePublishableKey(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!raw) {
    return undefined;
  }

  // New-style publishable keys (sb_publishable_...) are used as-is.
  return raw;
}

export function getSupabaseEnv():
  | { configured: true; env: SupabaseEnv }
  | SupabaseEnvIssue {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = resolvePublishableKey();

  if (!url || !publishableKey) {
    return {
      configured: false,
      message:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    };
  }

  if (
    url.includes(PLACEHOLDER_URL) ||
    PLACEHOLDER_KEYS.has(publishableKey) ||
    publishableKey.startsWith("your-")
  ) {
    return {
      configured: false,
      message:
        "Supabase still uses placeholder values in .env.local. Copy your Project URL and publishable key from the Supabase dashboard (Connect → Next.js), then restart the dev server.",
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      configured: false,
      message:
        "NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Check .env.local and restart the dev server.",
    };
  }

  return {
    configured: true,
    env: { url, publishableKey },
  };
}

export function requireSupabaseEnv(): SupabaseEnv {
  const result = getSupabaseEnv();

  if (!result.configured) {
    throw new Error(result.message);
  }

  return result.env;
}

export function isSupabaseFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  );
}

export function supabaseConnectionErrorMessage(): string {
  return "Unable to reach Supabase. Verify your Project URL and publishable key in .env.local, confirm the project is running, then restart `npm run dev`.";
}
