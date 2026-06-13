import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format/display";
import { createClient } from "@/lib/supabase/server";

type DealerOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DealerOrderDetailPage({
  params,
}: DealerOrderDetailPageProps) {
  await requireRole("dealer");
  const { id } = await params;

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .select("id, order_number, status, total_amount, notes, created_at, updated_at")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    notFound();
  }

  const { data: lineItems, error: itemsError } = await supabase
    .from("order_items")
    .select("id, quantity, unit_price, products(name, sku)")
    .eq("purchase_order_id", id)
    .order("created_at");

  if (itemsError) {
    console.error("DealerOrderDetailPage items", itemsError);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dealer/orders"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {order.order_number}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-zinc-600">
          Submitted {formatDate(order.created_at)}
          {order.updated_at !== order.created_at
            ? ` · Updated ${formatDate(order.updated_at)}`
            : null}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  SKU
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Qty
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Unit price
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(lineItems ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-medium text-zinc-900">
                    {item.products?.name ?? "Product"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-600">
                    {item.products?.sku ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right text-zinc-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-right text-zinc-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-zinc-900">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
        <span className="text-sm font-medium text-zinc-600">Order total</span>
        <span className="text-xl font-semibold text-zinc-900">
          {formatCurrency(order.total_amount)}
        </span>
      </div>

      {order.notes ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-700 shadow-sm">
          <p className="font-medium text-zinc-900">Notes</p>
          <p className="mt-1">{order.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
