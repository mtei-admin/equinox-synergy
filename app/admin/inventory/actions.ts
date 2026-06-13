"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type InventoryActionState = {
  error?: string;
  success?: string;
};

function revalidateInventoryPaths() {
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/dealer/inventory");
  revalidatePath("/dealer");
}

function parseNumber(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} must be a valid non-negative number.`);
  }

  return parsed;
}

export async function createProduct(
  _prevState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  await requireRole("employee");

  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!sku || !name) {
    return { error: "SKU and name are required." };
  }

  try {
    const supplierCost = parseNumber(formData.get("supplier_cost"), "Supplier cost");
    const dealerPrice = parseNumber(formData.get("dealer_price"), "Dealer price");
    const stockQuantity = parseNumber(
      formData.get("stock_quantity"),
      "Stock quantity",
    );

    const supabase = await createClient();
    const { error } = await supabase.from("products").insert({
      sku,
      name,
      description,
      supplier_cost: supplierCost,
      dealer_price: dealerPrice,
      stock_quantity: Math.floor(stockQuantity),
    });

    if (error) {
      console.error("createProduct", error);
      return { error: error.message };
    }

    revalidateInventoryPaths();
    return { success: `Product ${sku} created.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create product.",
    };
  }
}

export async function updateProduct(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  try {
    const name = String(formData.get("name") ?? "").trim();
    const supplierCost = parseNumber(formData.get("supplier_cost"), "Supplier cost");
    const dealerPrice = parseNumber(formData.get("dealer_price"), "Dealer price");
    const stockQuantity = parseNumber(
      formData.get("stock_quantity"),
      "Stock quantity",
    );

    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({
        name,
        supplier_cost: supplierCost,
        dealer_price: dealerPrice,
        stock_quantity: Math.floor(stockQuantity),
      })
      .eq("id", id);

    if (error) {
      console.error("updateProduct", error);
      return;
    }

    revalidateInventoryPaths();
  } catch (error) {
    console.error("updateProduct", error);
  }
}

export async function deactivateProduct(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("deactivateProduct", error);
    return;
  }

  revalidateInventoryPaths();
}
