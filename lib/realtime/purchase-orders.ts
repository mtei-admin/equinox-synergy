import type { PurchaseOrder } from "@/lib/database.types";

export const ADMIN_PO_CHANNEL = "admin-purchase-orders";

export type PurchaseOrderInsertPayload = Pick<
  PurchaseOrder,
  "id" | "order_number" | "total_amount" | "status" | "created_at" | "dealer_id"
>;

export function isPurchaseOrderInsertPayload(
  value: unknown,
): value is PurchaseOrderInsertPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.order_number === "string" &&
    typeof record.total_amount === "number"
  );
}
