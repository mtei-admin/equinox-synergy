import {
  approvePurchaseRequest,
  createGoodsReceipt,
  submitPurchaseRequest,
  createSupplierPurchaseOrder,
  postGoodsReceipt,
} from "@/app/admin/purchasing/actions";
import {
  GOODS_RECEIPT_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_LABELS,
  SUPPLIER_ORDER_STATUS_LABELS,
} from "@/lib/wms/labels";
import { requireRole } from "@/lib/auth/session";
import { formatDate } from "@/lib/format/display";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPurchasingPage() {
  await requireRole("employee");

  const supabase = await createClient();

  const [
    { data: suppliers },
    { data: products },
    { data: purchaseRequests },
    { data: supplierOrders },
    { data: goodsReceipts },
  ] = await Promise.all([
    supabase.from("suppliers").select("*").eq("is_active", true).order("name"),
    supabase.from("products").select("id, sku, name").eq("is_active", true).order("name"),
    supabase
      .from("purchase_requests")
      .select("id, pr_number, status, notes, created_at, purchase_request_lines(quantity_requested, products(sku, name))")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("supplier_purchase_orders")
      .select("id, spo_number, status, total_amount, created_at, suppliers(name, code), supplier_order_lines(quantity_ordered, quantity_received, products(sku, name))")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("goods_receipts")
      .select("id, receipt_number, status, received_at, posted_at, supplier_purchase_orders(spo_number)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Purchasing</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Inbound flow: purchase requests, supplier POs, warehouse receiving, and
          inventory posting.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-white">Purchase request</h2>
        <form action={submitPurchaseRequest} className="grid gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm text-zinc-300">Product</label>
            <select
              name="product_id"
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select product</option>
              {(products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} — {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-300">Quantity</label>
            <input
              name="quantity_requested"
              type="number"
              min={1}
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Submit PR
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="px-3 py-2">PR #</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Lines</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(purchaseRequests ?? []).map((pr) => (
                <tr key={pr.id}>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-200">
                    {pr.pr_number}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {PURCHASE_REQUEST_STATUS_LABELS[pr.status]}
                  </td>
                  <td className="px-3 py-3 text-zinc-400">
                    {(pr.purchase_request_lines ?? [])
                      .map(
                        (line) =>
                          `${line.products?.sku ?? "?"} × ${line.quantity_requested}`,
                      )
                      .join(", ")}
                  </td>
                  <td className="px-3 py-3 text-zinc-500">
                    {formatDate(pr.created_at)}
                  </td>
                  <td className="px-3 py-3">
                    {pr.status === "submitted" ? (
                      <form action={approvePurchaseRequest}>
                        <input type="hidden" name="id" value={pr.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          Approve
                        </button>
                      </form>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-white">Supplier purchase order</h2>
        <form action={createSupplierPurchaseOrder} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm text-zinc-300">Supplier</label>
            <select
              name="supplier_id"
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select supplier</option>
              {(suppliers ?? []).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.code} — {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm text-zinc-300">From PR (optional)</label>
            <select
              name="purchase_request_id"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">None</option>
              {(purchaseRequests ?? [])
                .filter((pr) => pr.status === "approved")
                .map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.pr_number}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm text-zinc-300">Product</label>
            <select
              name="product_id"
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select product</option>
              {(products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-300">Qty</label>
            <input
              name="quantity_ordered"
              type="number"
              min={1}
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-300">Unit cost</label>
            <input
              name="unit_cost"
              type="number"
              step="0.01"
              min={0}
              defaultValue={0}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end lg:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Create SPO
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="px-3 py-2">SPO #</th>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Lines</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(supplierOrders ?? []).map((spo) => (
                <tr key={spo.id}>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-200">
                    {spo.spo_number}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {spo.suppliers?.name ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {SUPPLIER_ORDER_STATUS_LABELS[spo.status]}
                  </td>
                  <td className="px-3 py-3 text-zinc-400">
                    {(spo.supplier_order_lines ?? [])
                      .map(
                        (line) =>
                          `${line.products?.sku ?? "?"} ${line.quantity_received}/${line.quantity_ordered}`,
                      )
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-white">Goods receipt</h2>
        <form action={createGoodsReceipt} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm text-zinc-300">Supplier PO</label>
            <select
              name="supplier_purchase_order_id"
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select SPO</option>
              {(supplierOrders ?? [])
                .filter((spo) => spo.status !== "received")
                .map((spo) => (
                  <option key={spo.id} value={spo.id}>
                    {spo.spo_number}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm text-zinc-300">Product</label>
            <select
              name="product_id"
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select product</option>
              {(products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-300">Received</label>
            <input
              name="quantity_received"
              type="number"
              min={1}
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-300">Accepted</label>
            <input
              name="quantity_accepted"
              type="number"
              min={0}
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Record receipt
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="px-3 py-2">GR #</th>
                <th className="px-3 py-2">SPO</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Received</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(goodsReceipts ?? []).map((receipt) => (
                <tr key={receipt.id}>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-200">
                    {receipt.receipt_number}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {receipt.supplier_purchase_orders?.spo_number ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {GOODS_RECEIPT_STATUS_LABELS[receipt.status]}
                  </td>
                  <td className="px-3 py-3 text-zinc-500">
                    {receipt.received_at ? formatDate(receipt.received_at) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    {receipt.status !== "posted" ? (
                      <form action={postGoodsReceipt}>
                        <input type="hidden" name="receipt_id" value={receipt.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10"
                        >
                          Post to inventory
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-emerald-400">Posted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
