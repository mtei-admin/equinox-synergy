"use client";

import { useActionState } from "react";
import {
  createDealerAccount,
  type DealerActionState,
} from "@/app/admin/dealers/actions";

const initialState: DealerActionState = {};

export function DealerCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createDealerAccount,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Create dealer account</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Provisions Supabase Auth and a dealer profile in one step.
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Temporary password" name="password" type="password" required />
        <Field label="Company name" name="company_name" required />
        <Field label="Contact name" name="contact_name" required />
        <Field label="Phone" name="contact_phone" type="tel" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Creating..." : "Create dealer"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
        required={required}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
