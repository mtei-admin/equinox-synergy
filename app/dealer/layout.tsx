import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { href: "/dealer", label: "Dashboard" },
  { href: "/dealer/inventory", label: "Inventory" },
  { href: "/dealer/orders", label: "Orders" },
  { href: "/dealer/assets", label: "Assets" },
];

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("dealer");

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Dealer Portal
            </p>
            <p className="text-sm font-medium text-zinc-900">
              {session.profile.company_name ?? session.user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
