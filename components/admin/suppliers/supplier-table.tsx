import {
  deactivateSupplier,
  updateSupplier,
} from "@/app/admin/suppliers/actions";
import { formatDate } from "@/lib/format/display";
import type { Supplier } from "@/lib/database.types";

type SupplierTableProps = {
  suppliers: Supplier[];
};

export function SupplierTable({ suppliers }: SupplierTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {suppliers.map((supplier) => (
        <form
          key={`supplier-form-${supplier.id}`}
          id={`supplier-form-${supplier.id}`}
          action={updateSupplier}
          hidden
        >
          <input type="hidden" name="id" value={supplier.id} />
        </form>
      ))}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-950/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Code</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Added</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {suppliers.map((supplier) => {
              const formId = `supplier-form-${supplier.id}`;

              return (
                <tr key={supplier.id}>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-300">
                    {supplier.code}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="name"
                      defaultValue={supplier.name}
                      className="w-full min-w-36 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="contact_name"
                      defaultValue={supplier.contact_name ?? ""}
                      className="w-full min-w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="contact_email"
                      type="email"
                      defaultValue={supplier.contact_email ?? ""}
                      className="w-full min-w-36 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="contact_phone"
                      defaultValue={supplier.contact_phone ?? ""}
                      className="w-full min-w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4 text-zinc-500">
                    {formatDate(supplier.created_at)}
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
                      <form action={deactivateSupplier}>
                        <input type="hidden" name="id" value={supplier.id} />
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

      {suppliers.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No suppliers yet. Add your first vendor above.
        </p>
      ) : null}
    </div>
  );
}
