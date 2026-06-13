"use client";

import { useActionState } from "react";
import {
  createProduct,
  type InventoryActionState,
} from "@/app/admin/inventory/actions";

const initialState: InventoryActionState = {};

export function ProductCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Add product</h2>
        <p className="mt-1 text-sm text-zinc-400">
          New SKUs appear in the dealer catalog immediately.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="SKU" name="sku" required />
        <Field label="Name" name="name" required />
        <Field label="Stock quantity" name="stock_quantity" type="number" defaultValue="0" required />
        <Field label="Supplier cost" name="supplier_cost" type="number" step="0.01" defaultValue="0" required />
        <Field label="Dealer price" name="dealer_price" type="number" step="0.01" defaultValue="0" required />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create product"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
