"use client";

import { useActionState } from "react";
import {
  createSupplier,
  type SupplierActionState,
} from "@/app/admin/suppliers/actions";

const initialState: SupplierActionState = {};

export function SupplierCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createSupplier,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Add supplier</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Vendor master used for inbound purchase orders.
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
        <Field label="Code" name="code" required placeholder="SUP-001" />
        <Field label="Name" name="name" required />
        <Field label="Contact name" name="contact_name" />
        <Field label="Email" name="contact_email" type="email" />
        <Field label="Phone" name="contact_phone" />
        <Field label="Address" name="address" className="sm:col-span-2 lg:col-span-3" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Add supplier"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
