import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format/display";
import { FULFILLMENT_STATUSES, ORDER_STATUS_LABELS } from "@/lib/orders/helpers";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  await requireRole("employee");

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("purchase_orders")
    .select(
      "id, order_number, status, total_amount, created_at, profiles(company_name, contact_name, contact_email)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("AdminOrdersPage", error);
  }

  const pendingCount = (orders ?? []).filter(
    (order) => order.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Order Fulfillment</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review dealer purchase orders and advance fulfillment status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Pending review</p>
          <p className="mt-2 text-2xl font-semibold text-white">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total orders</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {(orders ?? []).length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">In pipeline</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {(orders ?? []).filter((order) =>
              ["pending", "processing", "dispatched"].includes(order.status),
            ).length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Order
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Dealer
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Update
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">
                  Fulfillment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(orders ?? []).map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-4 font-medium text-white">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    <p>{order.profiles?.company_name ?? "Dealer"}</p>
                    <p className="text-xs text-zinc-500">
                      {order.profiles?.contact_name ??
                        order.profiles?.contact_email}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} theme="admin" />
                  </td>
                  <td className="px-4 py-4 font-medium text-white">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-4 text-zinc-400">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <form action={updateOrderStatus} className="flex gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-200"
                      >
                        {FULFILLMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-zinc-300 underline hover:text-white"
                    >
                      Workflow
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(orders ?? []).length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No dealer purchase orders yet.
          </p>
        ) : null}
      </div>

      <p className="text-sm text-zinc-500">
        Dealers see status updates on{" "}
        <Link href="/dealer/orders" className="text-zinc-300 underline">
          their orders page
        </Link>
        .
      </p>
    </div>
  );
}
