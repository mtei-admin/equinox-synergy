import Link from "next/link";
import { PurchaseOrderAlerts } from "@/components/admin/purchase-order-alerts";
import { requireRole } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/purchasing", label: "Purchasing" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/fulfillment", label: "Fulfillment" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/dealers", label: "Dealers" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("employee");

  return (
    <div className="flex min-h-full flex-col bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Employee Admin
            </p>
            <p className="text-sm font-medium text-white">
              {session.profile.contact_name ?? session.user.email}
            </p>
          </div>
          <SignOutButton inverted />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
      <PurchaseOrderAlerts />
    </div>
  );
}
