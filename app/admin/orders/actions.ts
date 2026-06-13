"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import type { PurchaseOrderStatus } from "@/lib/database.types";
import { FULFILLMENT_STATUSES } from "@/lib/orders/helpers";
import { createClient } from "@/lib/supabase/server";

export async function updateOrderStatus(formData: FormData) {
  await requireRole("employee");

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as PurchaseOrderStatus;

  if (!orderId || !FULFILLMENT_STATUSES.includes(status)) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("updateOrderStatus", error);
    return;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/dealer/orders");
}
