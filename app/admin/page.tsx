import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/format/display";
import { computeInventoryStats } from "@/lib/inventory/helpers";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const session = await requireRole("employee");
  const supabase = await createClient();

  const [
    { count: pendingOrders },
    { data: products },
    { count: draftAssets },
    { count: activeDealers },
  ] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("products").select("*").eq("is_active", true),
    supabase
      .from("cms_assets")
      .select("*", { count: "exact", head: true })
      .eq("is_published", false)
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "dealer")
      .eq("is_active", true),
  ]);

  const inventoryStats = computeInventoryStats(products ?? []);

  const cards = [
    {
      label: "Pending POs",
      value: pendingOrders ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Low stock SKUs",
      value: inventoryStats.lowStockCount,
      href: "/admin/inventory",
    },
    {
      label: "Active dealers",
      value: activeDealers ?? 0,
      href: "/admin/dealers",
    },
    {
      label: "Draft assets",
      value: draftAssets ?? 0,
      href: "/admin/cms",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Operations Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage inventory, fulfill dealer orders, and publish CMS assets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-white">Inventory snapshot</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">Cost value</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(inventoryStats.costValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Wholesale value</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(inventoryStats.retailValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Units on hand</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {inventoryStats.totalUnits}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        Signed in as {session.user.email ?? session.profile.contact_email}.
      </p>
    </div>
  );
}
