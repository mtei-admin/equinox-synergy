import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import {
  ADMIN_HOME,
  DEALER_HOME,
  LOGIN_ROUTE,
  homeRouteForRole,
  isPublicRoute,
} from "@/lib/auth/routes";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const envResult = getSupabaseEnv();

  if (!envResult.configured) {
    return supabaseResponse;
  }

  const { url, publishableKey } = envResult.env;

  const supabase = createServerClient<Database>(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPublic) {
      return supabaseResponse;
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_ROUTE;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.is_active) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_ROUTE;
    loginUrl.searchParams.set("error", "inactive");
    return NextResponse.redirect(loginUrl);
  }

  const home = homeRouteForRole(profile.role);

  if (pathname === "/" || pathname === LOGIN_ROUTE) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = home;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith(ADMIN_HOME) && profile.role !== "employee") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DEALER_HOME;
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith(DEALER_HOME) && profile.role === "employee") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ADMIN_HOME;
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
