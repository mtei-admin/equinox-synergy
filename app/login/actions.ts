"use server";

import { redirect } from "next/navigation";
import { LOGIN_ROUTE, homeRouteForRole } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import {
  getSupabaseEnv,
  isSupabaseFetchError,
  supabaseConnectionErrorMessage,
} from "@/lib/supabase/env";

export type SignInState = {
  error?: string;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const config = getSupabaseEnv();

  if (!config.configured) {
    return { error: config.message };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const supabase = await createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { error: signInError.message };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unable to establish a session. Please try again." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return { error: "Your account profile could not be loaded." };
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      return { error: "Your account is inactive. Contact Equinox support." };
    }

    const nextPath = String(formData.get("next") ?? "").trim();
    if (nextPath.startsWith("/dealer") && profile.role === "dealer") {
      redirect(nextPath);
    }
    if (nextPath.startsWith("/admin") && profile.role === "employee") {
      redirect(nextPath);
    }

    redirect(homeRouteForRole(profile.role));
  } catch (error) {
    if (isSupabaseFetchError(error)) {
      return { error: supabaseConnectionErrorMessage() };
    }

    throw error;
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(LOGIN_ROUTE);
}
