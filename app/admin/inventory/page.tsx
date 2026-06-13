import { ProductCreateForm } from "@/components/admin/inventory/product-create-form";
import { ProductTable } from "@/components/admin/inventory/product-table";
import { formatCurrency } from "@/lib/format/display";
import {
  computeInventoryStats,
  LOW_STOCK_THRESHOLD_VALUE,
} from "@/lib/inventory/helpers";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInventoryPage() {
  await requireRole("employee");

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("AdminInventoryPage", error);
  }

  const stats = computeInventoryStats(products ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Inventory</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Track stock levels, cost valuations, and wholesale pricing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active SKUs", value: String(stats.activeSkus) },
          { label: "Total units", value: String(stats.totalUnits) },
          {
            label: "Inventory cost value",
            value: formatCurrency(stats.costValue),
          },
          {
            label: "Wholesale value",
            value: formatCurrency(stats.retailValue),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200">Low stock alerts</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {stats.lowStockCount}
          </p>
          <p className="mt-1 text-xs text-amber-200/80">
            SKUs at or below {LOW_STOCK_THRESHOLD_VALUE} units
          </p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">Out of stock</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {stats.outOfStockCount}
          </p>
          <p className="mt-1 text-xs text-red-200/80">
            Dealers may still pre-order these SKUs
          </p>
        </div>
      </div>

      <ProductCreateForm />
      <ProductTable products={products ?? []} />
    </div>
  );
}
