"use client";

import { useActionState, useEffect, useState } from "react";
import {
  adjustProductStock,
  type InventoryActionState,
} from "@/app/admin/inventory/actions";

const initialState: InventoryActionState = {};

type StockAdjustmentButtonProps = {
  productId: string;
  sku: string;
  currentStock: number;
};

export function StockAdjustmentButton({
  productId,
  sku,
  currentStock,
}: StockAdjustmentButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    adjustProductStock,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
      >
        Stock adjustment
      </button>
    );
  }

  return (
    <div className="min-w-56 space-y-2 rounded-lg border border-zinc-700 bg-zinc-950 p-3">
      <p className="text-xs font-medium text-zinc-300">
        Adjust stock · {sku}
      </p>
      <p className="text-xs text-zinc-500">Current: {currentStock} units</p>

      {state.error ? (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="id" value={productId} />
        <div className="flex flex-col gap-1">
          <label htmlFor={`stock-${productId}`} className="text-xs text-zinc-400">
            New quantity
          </label>
          <input
            id={`stock-${productId}`}
            name="stock_quantity"
            type="number"
            min={0}
            required
            defaultValue={currentStock}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <input
          name="notes"
          placeholder="Reason (optional)"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Apply"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
