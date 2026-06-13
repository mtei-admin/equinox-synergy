"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  submitPurchaseOrder,
  type SubmitOrderState,
} from "@/app/dealer/inventory/actions";
import { formatCurrency } from "@/lib/format/display";
import { stockIndicator } from "@/lib/orders/helpers";
import type { DealerProduct } from "@/lib/database.types";

const initialState: SubmitOrderState = {};

type InventoryCatalogProps = {
  products: DealerProduct[];
};

type CartEntry = {
  product: DealerProduct;
  quantity: number;
};

export function InventoryCatalog({ products }: InventoryCatalogProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [state, setState] = useState<SubmitOrderState>(initialState);
  const [isPending, startTransition] = useTransition();

  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((entry) => entry.id === productId);
        if (!product || quantity <= 0) {
          return null;
        }

        return { product, quantity } satisfies CartEntry;
      })
      .filter((entry): entry is CartEntry => entry !== null);
  }, [cart, products]);

  const cartTotal = cartEntries.reduce(
    (sum, entry) => sum + entry.quantity * (entry.product.dealer_price ?? 0),
    0,
  );

  const cartPayload = JSON.stringify(
    cartEntries.map((entry) => ({
      productId: entry.product.id,
      quantity: entry.quantity,
    })),
  );

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitPurchaseOrder(state, formData);
      setState(result);

      if (result.success) {
        setCart({});
      }
    });
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }

      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Availability
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => {
                const stock = stockIndicator(product.stock_quantity ?? 0);
                const inCart = cart[product.id!] ?? 0;
                const outOfStock = (product.stock_quantity ?? 0) <= 0;

                return (
                  <tr key={product.id}>
                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-900">{product.name}</p>
                      {product.description ? (
                        <p className="mt-1 max-w-md text-xs text-zinc-500">
                          {product.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-zinc-600">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4 font-medium text-zinc-900">
                      {formatCurrency(product.dealer_price ?? 0)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          stock.tone === "in"
                            ? "text-emerald-700"
                            : stock.tone === "low"
                              ? "text-amber-700"
                              : "text-red-700"
                        }
                      >
                        {stock.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min={0}
                          max={product.stock_quantity ?? 0}
                          value={inCart}
                          disabled={outOfStock}
                          onChange={(event) =>
                            setQuantity(
                              product.id!,
                              Number(event.target.value),
                            )
                          }
                          className="w-20 rounded-lg border border-zinc-300 px-2 py-1.5 text-right disabled:cursor-not-allowed disabled:bg-zinc-100"
                        />
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
            No products are available in the catalog yet.
          </p>
        ) : null}
      </div>

      <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Order cart</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Quantities lock in at submission.
        </p>

        <div className="mt-4 space-y-3">
          {cartEntries.length === 0 ? (
            <p className="text-sm text-zinc-500">No items added yet.</p>
          ) : (
            cartEntries.map((entry) => (
              <div
                key={entry.product.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {entry.product.name}
                  </p>
                  <p className="text-zinc-500">Qty {entry.quantity}</p>
                </div>
                <p className="font-medium text-zinc-900">
                  {formatCurrency(
                    entry.quantity * (entry.product.dealer_price ?? 0),
                  )}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
          <span className="text-sm font-medium text-zinc-600">Total</span>
          <span className="text-lg font-semibold text-zinc-900">
            {formatCurrency(cartTotal)}
          </span>
        </div>

        {state.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <div className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            <p>{state.success}</p>
            {state.orderId ? (
              <Link
                href={`/dealer/orders/${state.orderId}`}
                className="font-medium underline"
              >
                View order
              </Link>
            ) : null}
          </div>
        ) : null}

        <form action={handleSubmit} className="mt-4">
          <input type="hidden" name="items" value={cartPayload} readOnly />
          <button
            type="submit"
            disabled={isPending || cartEntries.length === 0}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit purchase order"}
          </button>
        </form>
      </aside>
    </div>
  );
}
