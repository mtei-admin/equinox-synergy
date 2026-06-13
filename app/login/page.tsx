import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseEnv } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : undefined;
  const inactiveAccount = params.error === "inactive";
  const supabaseConfig = getSupabaseEnv();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-black px-6 py-5">
          <Image
            src="/equinox-synergy-logo.png"
            alt="Equinox Synergy"
            width={320}
            height={240}
            priority
            className="mx-auto h-auto w-full max-w-[220px] object-contain"
          />
        </div>

        <div className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
            <p className="text-sm text-zinc-600">
              Access your dealer portal or employee dashboard.
            </p>
          </div>

          {!supabaseConfig.configured ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {supabaseConfig.message}
            </p>
          ) : null}

          <LoginForm nextPath={nextPath} inactiveAccount={inactiveAccount} />
        </div>
      </div>
    </div>
  );
}
