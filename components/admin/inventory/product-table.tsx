import {
  deactivateProduct,
  updateProduct,
} from "@/app/admin/inventory/actions";
import { formatCurrency } from "@/lib/format/display";
import { isLowStock } from "@/lib/inventory/helpers";
import type { Product } from "@/lib/database.types";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {products.map((product) => (
        <form
          key={`form-${product.id}`}
          id={`product-form-${product.id}`}
          action={updateProduct}
          hidden
        >
          <input type="hidden" name="id" value={product.id} />
        </form>
      ))}

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
              const formId = `product-form-${product.id}`;
              const lowStock = isLowStock(product.stock_quantity);
              const outOfStock = product.stock_quantity <= 0;

              return (
                <tr key={product.id}>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-300">
                    {product.sku}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="name"
                      defaultValue={product.name}
                      className="w-full min-w-36 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="model"
                      defaultValue={product.model ?? ""}
                      className="w-full min-w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="serial_number"
                      defaultValue={product.serial_number ?? ""}
                      className="w-full min-w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
                    />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <input
                      form={formId}
                      name="supplier_cost"
                      type="number"
                      step="0.01"
                      defaultValue={product.supplier_cost}
                      className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-right text-white"
                    />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <input
                      form={formId}
                      name="dealer_price"
                      type="number"
                      step="0.01"
                      defaultValue={product.dealer_price}
                      className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-right text-white"
                    />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <input
                      form={formId}
                      name="stock_quantity"
                      type="number"
                      defaultValue={product.stock_quantity}
                      className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-right text-white"
                    />
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        form={formId}
                        type="submit"
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                      >
                        Save
                      </button>
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
  );
}
