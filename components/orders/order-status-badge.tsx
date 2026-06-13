import type { PurchaseOrderStatus } from "@/lib/database.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/orders/helpers";

type OrderStatusBadgeProps = {
  status: PurchaseOrderStatus;
  theme?: "dealer" | "admin";
};

export function OrderStatusBadge({
  status,
  theme = "dealer",
}: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[status][theme]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
