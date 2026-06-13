import { deactivateProduct } from "@/app/admin/inventory/actions";
import { StockAdjustmentButton } from "@/components/admin/inventory/stock-adjustment-button";
import { formatCurrency } from "@/lib/format/display";
import { isLowStock } from "@/lib/inventory/helpers";
import type { Product } from "@/lib/database.types";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-white">Product catalog</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Catalog details are read-only. Use stock adjustment to change quantities.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Product</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Model</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Serial #</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Cost</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Dealer</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Stock</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Cost value</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((product) => {
                const lowStock = isLowStock(product.stock_quantity);
                const outOfStock = product.stock_quantity <= 0;

                return (
                  <tr key={product.id}>
                    <td className="px-4 py-4 font-mono text-xs text-zinc-300">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4 font-medium text-white">
                      {product.name}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {product.model ?? "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-zinc-400">
                      {product.serial_number ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-right text-zinc-300">
                      {formatCurrency(product.supplier_cost)}
                    </td>
                    <td className="px-4 py-4 text-right text-zinc-300">
                      {formatCurrency(product.dealer_price)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-white">
                        {product.stock_quantity}
                      </span>
                      <p
                        className={
                          outOfStock
                            ? "mt-1 text-xs text-red-400"
                            : lowStock
                              ? "mt-1 text-xs text-amber-400"
                              : "mt-1 text-xs text-emerald-400"
                        }
                      >
                        {outOfStock
                          ? "Out of stock"
                          : lowStock
                            ? "Low stock"
                            : "Healthy"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right text-zinc-300">
                      {formatCurrency(
                        product.supplier_cost * product.stock_quantity,
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-start gap-2">
                        <StockAdjustmentButton
                          productId={product.id}
                          sku={product.sku}
                          currentStock={product.stock_quantity}
                        />
                        <form action={deactivateProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10"
                          >
                            Archive
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No active products in inventory.
          </p>
        ) : null}
      </div>
    </div>
  );
}
