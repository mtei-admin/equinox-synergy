import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format/display";
import { createClient } from "@/lib/supabase/server";

export default async function AdminFulfillmentPage() {
  await requireRole("employee");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("purchase_orders")
    .select(
      "id, order_number, status, total_amount, created_at, profiles(company_name), delivery_receipts(id, status), sales_invoices(id, status)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Fulfillment</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Outbound pipeline: invoice, delivery receipt, picking, dispatch, and
          proof of delivery.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Order</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Dealer</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Invoice</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">DR</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Total</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(orders ?? []).map((order) => {
                const invoice = order.sales_invoices?.[0];
                const dr = order.delivery_receipts?.[0];

                return (
                  <tr key={order.id}>
                    <td className="px-4 py-4 font-medium text-white">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {order.profiles?.company_name ?? "Dealer"}
                    </td>
                    <td className="px-4 py-4">
                      <OrderStatusBadge status={order.status} theme="admin" />
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {invoice ? invoice.status : "—"}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">{dr ? dr.status : "—"}</td>
                    <td className="px-4 py-4 text-white">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                      >
                        Open workflow
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(orders ?? []).length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No dealer orders to fulfill yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
