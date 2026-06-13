import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type AppSupabase = SupabaseClient<Database>;

export async function getLedgerBalance(
  supabase: AppSupabase,
  productId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("inventory_transactions")
    .select("quantity_delta")
    .eq("product_id", productId);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce((sum, row) => sum + row.quantity_delta, 0);
}

export async function recordStockAdjustment(
  supabase: AppSupabase,
  productId: string,
  targetQuantity: number,
  notes: string,
): Promise<void> {
  const currentBalance = await getLedgerBalance(supabase, productId);
  const delta = Math.floor(targetQuantity) - currentBalance;

  if (delta === 0) {
    return;
  }

  const { error } = await supabase.from("inventory_transactions").insert({
    product_id: productId,
    txn_type: "adjust",
    quantity_delta: delta,
    reference_type: "manual_adjustment",
    notes,
  });

  if (error) {
    throw error;
  }
}

export async function recordInitialStock(
  supabase: AppSupabase,
  productId: string,
  quantity: number,
): Promise<void> {
  const initial = Math.floor(quantity);
  if (initial <= 0) {
    return;
  }

  const { error } = await supabase.from("inventory_transactions").insert({
    product_id: productId,
    txn_type: "adjust",
    quantity_delta: initial,
    reference_type: "manual_adjustment",
    notes: "Initial stock on product create",
  });

  if (error) {
    throw error;
  }
}
