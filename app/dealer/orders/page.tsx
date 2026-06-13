import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format/display";
import { createClient } from "@/lib/supabase/server";

export default async function DealerOrdersPage() {
  await requireRole("dealer");

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("purchase_orders")
    .select("id, order_number, status, total_amount, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DealerOrdersPage", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Track purchase order status from submission through fulfillment.
          </p>
        </div>
        <Link
          href="/dealer/inventory"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          New order
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Order
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/dealer/orders/${order.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(orders ?? []).length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No purchase orders yet. Build a cart from the inventory catalog.
          </p>
        ) : null}
      </div>
    </div>
  );
}
