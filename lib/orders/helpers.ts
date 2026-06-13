import type { PurchaseOrderStatus } from "@/lib/database.types";

export type StockTone = "in" | "low" | "out";

export function stockIndicator(quantity: number): {
  label: string;
  tone: StockTone;
} {
  if (quantity <= 0) {
    return { label: "Out of stock", tone: "out" };
  }

  if (quantity <= 10) {
    return { label: `Low stock (${quantity})`, tone: "low" };
  }

  return { label: "In stock", tone: "in" };
}

export const ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_STYLES: Record<
  PurchaseOrderStatus,
  { dealer: string; admin: string }
> = {
  pending: {
    dealer: "bg-amber-100 text-amber-800",
    admin: "bg-amber-500/20 text-amber-300",
  },
  processing: {
    dealer: "bg-blue-100 text-blue-800",
    admin: "bg-blue-500/20 text-blue-300",
  },
  dispatched: {
    dealer: "bg-violet-100 text-violet-800",
    admin: "bg-violet-500/20 text-violet-300",
  },
  completed: {
    dealer: "bg-emerald-100 text-emerald-800",
    admin: "bg-emerald-500/20 text-emerald-300",
  },
  cancelled: {
    dealer: "bg-zinc-200 text-zinc-700",
    admin: "bg-zinc-500/20 text-zinc-300",
  },
};

export const FULFILLMENT_STATUSES: PurchaseOrderStatus[] = [
  "pending",
  "processing",
  "dispatched",
  "completed",
  "cancelled",
];

export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `PO-${date}-${suffix}`;
}
