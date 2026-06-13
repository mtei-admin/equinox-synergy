import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createDeliveryReceipt,
  createOutboundShipment,
  createPickList,
  createSalesInvoice,
  dispatchShipment,
  postPickList,
  recordProofOfDelivery,
} from "@/app/admin/fulfillment/actions";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  DELIVERY_RECEIPT_STATUS_LABELS,
  OUTBOUND_SHIPMENT_STATUS_LABELS,
  SALES_INVOICE_STATUS_LABELS,
} from "@/lib/wms/labels";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/format/display";
import { createClient } from "@/lib/supabase/server";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  await requireRole("employee");
  const { id } = await params;

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .select(
      "id, order_number, status, total_amount, notes, created_at, profiles(company_name, contact_name, contact_email)",
    )
    .eq("id", id)
    .single();

  if (orderError || !order) {
    notFound();
  }

  const [
    { data: lineItems },
    { data: invoices },
    { data: deliveryReceipts },
  ] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, quantity, unit_price, products(name, sku, model)")
      .eq("purchase_order_id", id),
    supabase
      .from("sales_invoices")
      .select("*")
      .eq("purchase_order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("delivery_receipts")
      .select(
        "*, pick_lists(*, pick_list_lines(id, quantity_requested, quantity_picked, products(sku))), outbound_shipments(*, proof_of_deliveries(*))",
      )
      .eq("purchase_order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const invoice = invoices?.[0] ?? null;
  const dr = deliveryReceipts?.[0] ?? null;
  const pickList = dr?.pick_lists?.[0] ?? null;
  const shipment = dr?.outbound_shipments?.[0] ?? null;
  const pod = shipment?.proof_of_deliveries?.[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/fulfillment"
          className="text-sm font-medium text-zinc-400 hover:text-white"
        >
          ← Back to fulfillment
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">{order.order_number}</h1>
          <OrderStatusBadge status={order.status} theme="admin" />
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {order.profiles?.company_name ?? "Dealer"} · Submitted{" "}
          {formatDate(order.created_at)}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-950/60">
            <tr>
              <th className="px-4 py-3 text-left text-zinc-400">Product</th>
              <th className="px-4 py-3 text-left text-zinc-400">SKU</th>
              <th className="px-4 py-3 text-right text-zinc-400">Qty</th>
              <th className="px-4 py-3 text-right text-zinc-400">Unit</th>
              <th className="px-4 py-3 text-right text-zinc-400">Line</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {(lineItems ?? []).map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-4 text-white">{item.products?.name}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-400">
                  {item.products?.sku}
                </td>
                <td className="px-4 py-4 text-right text-zinc-200">{item.quantity}</td>
                <td className="px-4 py-4 text-right text-zinc-200">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="px-4 py-4 text-right font-medium text-white">
                  {formatCurrency(item.quantity * item.unit_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between border-t border-zinc-800 px-4 py-3 text-sm">
          <span className="text-zinc-400">Order total</span>
          <span className="font-semibold text-white">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WorkflowCard
          step="1 · Invoice"
          status={invoice ? SALES_INVOICE_STATUS_LABELS[invoice.status] : "Not created"}
        >
          {invoice ? (
            <p className="text-sm text-zinc-300">
              {invoice.invoice_number} · {formatCurrency(invoice.amount)}
            </p>
          ) : (
            <form action={createSalesInvoice}>
              <input type="hidden" name="order_id" value={id} />
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
              >
                Issue invoice
              </button>
            </form>
          )}
        </WorkflowCard>

        <WorkflowCard
          step="2 · Delivery receipt"
          status={dr ? DELIVERY_RECEIPT_STATUS_LABELS[dr.status] : "Not created"}
        >
          {dr ? (
            <p className="font-mono text-sm text-zinc-300">{dr.dr_number}</p>
          ) : (
            <form action={createDeliveryReceipt}>
              <input type="hidden" name="order_id" value={id} />
              <button
                type="submit"
                disabled={!invoice}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Authorize DR
              </button>
            </form>
          )}
        </WorkflowCard>

        <WorkflowCard
          step="3 · Picking"
          status={pickList ? pickList.status : dr ? "Awaiting pick list" : "—"}
        >
          {pickList ? (
            <div className="space-y-2">
              <ul className="text-sm text-zinc-400">
                {(pickList.pick_list_lines ?? []).map((line) => (
                  <li key={line.id}>
                    {line.products?.sku}: {line.quantity_picked}/{line.quantity_requested}
                  </li>
                ))}
              </ul>
              {!pickList.posted_at ? (
                <form action={postPickList}>
                  <input type="hidden" name="order_id" value={id} />
                  <input type="hidden" name="pick_list_id" value={pickList.id} />
                  <input type="hidden" name="delivery_receipt_id" value={dr?.id ?? ""} />
                  <button
                    type="submit"
                    className="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10"
                  >
                    Post pick (deduct stock)
                  </button>
                </form>
              ) : (
                <p className="text-xs text-emerald-400">Posted {formatDate(pickList.posted_at)}</p>
              )}
            </div>
          ) : dr ? (
            <form action={createPickList}>
              <input type="hidden" name="order_id" value={id} />
              <input type="hidden" name="delivery_receipt_id" value={dr.id} />
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
              >
                Create pick list
              </button>
            </form>
          ) : null}
        </WorkflowCard>

        <WorkflowCard
          step="4 · Shipment"
          status={
            shipment
              ? OUTBOUND_SHIPMENT_STATUS_LABELS[shipment.status]
              : pickList?.posted_at
                ? "Awaiting shipment"
                : "—"
          }
        >
          {shipment ? (
            <div className="space-y-1 text-sm text-zinc-300">
              {shipment.trucker_name ? <p>Trucker: {shipment.trucker_name}</p> : null}
              {shipment.vehicle_plate ? <p>Plate: {shipment.vehicle_plate}</p> : null}
              {!pod && shipment.status !== "delivered" ? (
                <form action={dispatchShipment} className="pt-2">
                  <input type="hidden" name="order_id" value={id} />
                  <input type="hidden" name="shipment_id" value={shipment.id} />
                  <input type="hidden" name="delivery_receipt_id" value={dr?.id ?? ""} />
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    Mark dispatched
                  </button>
                </form>
              ) : null}
            </div>
          ) : pickList?.posted_at && dr ? (
            <form action={createOutboundShipment} className="space-y-3">
              <input type="hidden" name="order_id" value={id} />
              <input type="hidden" name="delivery_receipt_id" value={dr.id} />
              <input
                name="trucker_name"
                placeholder="Trucker name"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
              <input
                name="vehicle_plate"
                placeholder="Vehicle plate"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
              <input
                name="driver_phone"
                placeholder="Driver phone"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
              >
                Schedule shipment
              </button>
            </form>
          ) : null}
        </WorkflowCard>

        <WorkflowCard
          step="5 · Proof of delivery"
          status={pod ? `Signed by ${pod.signed_by}` : shipment ? "Awaiting POD" : "—"}
          className="lg:col-span-2"
        >
          {pod ? (
            <p className="text-sm text-zinc-300">
              Signed {formatDate(pod.signed_at)}
              {pod.notes ? ` · ${pod.notes}` : ""}
            </p>
          ) : shipment ? (
            <form action={recordProofOfDelivery} className="flex flex-wrap gap-3">
              <input type="hidden" name="order_id" value={id} />
              <input type="hidden" name="shipment_id" value={shipment.id} />
              <input type="hidden" name="delivery_receipt_id" value={dr?.id ?? ""} />
              <input
                name="signed_by"
                required
                placeholder="Signed by (customer name)"
                className="min-w-48 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
              <input
                name="notes"
                placeholder="Notes (optional)"
                className="min-w-48 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
              >
                Record POD & complete order
              </button>
            </form>
          ) : null}
        </WorkflowCard>
      </div>
    </div>
  );
}

function WorkflowCard({
  step,
  status,
  children,
  className = "",
}: {
  step: string;
  status: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900 p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{step}</h2>
        <span className="text-xs text-zinc-500">{status}</span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
