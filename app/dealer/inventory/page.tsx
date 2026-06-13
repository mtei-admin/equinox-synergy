import { InventoryCatalog } from "@/components/dealer/inventory-catalog";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function DealerInventoryPage() {
  await requireRole("dealer");

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products_dealer_catalog")
    .select("*")
    .order("name");

  if (error) {
    console.error("DealerInventoryPage", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Inventory</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Browse wholesale pricing and submit purchase orders, including
          pre-orders when stock is not on hand.
        </p>
      </div>

      <InventoryCatalog products={products ?? []} />
    </div>
  );
}
