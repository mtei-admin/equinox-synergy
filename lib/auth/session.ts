import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/database.types";
import { LOGIN_ROUTE, homeRouteForRole } from "@/lib/auth/routes";

export type AuthSession = {
  user: { id: string; email?: string };
  profile: Profile;
};

export async function getSession(): Promise<AuthSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_active) {
    return null;
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
  };
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect(LOGIN_ROUTE);
  }

  return session;
}

export async function requireRole(role: UserRole): Promise<AuthSession> {
  const session = await requireSession();

  if (session.profile.role !== role) {
    redirect(homeRouteForRole(session.profile.role));
  }

  return session;
}
