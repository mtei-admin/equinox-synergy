import { NextResponse } from "next/server";
import { homeRouteForRole } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

function resolveRedirectBase(request: Request, origin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return origin;
  }

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const redirectBase = resolveRedirectBase(request, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          const fallback = homeRouteForRole(profile.role);
          const destination =
            next?.startsWith("/") &&
            ((next.startsWith("/dealer") && profile.role === "dealer") ||
              (next.startsWith("/admin") && profile.role === "employee"))
              ? next
              : fallback;

          return NextResponse.redirect(`${redirectBase}${destination}`);
        }
      }
    }
  }

  return NextResponse.redirect(`${redirectBase}/login`);
}
