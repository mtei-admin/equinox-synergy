import {
  setDealerActive,
  updateDealerProfile,
} from "@/app/admin/dealers/actions";
import { formatDate } from "@/lib/format/display";
import type { Profile } from "@/lib/database.types";

type DealerTableProps = {
  dealers: Profile[];
};

export function DealerTable({ dealers }: DealerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {dealers.map((dealer) => (
        <form
          key={`dealer-form-${dealer.id}`}
          id={`dealer-form-${dealer.id}`}
          action={updateDealerProfile}
          hidden
        >
          <input type="hidden" name="id" value={dealer.id} />
        </form>
      ))}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-950/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Company</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {dealers.map((dealer) => {
              const formId = `dealer-form-${dealer.id}`;

              return (
                <tr key={dealer.id}>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="company_name"
                      defaultValue={dealer.company_name ?? ""}
                      className="w-full min-w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="contact_name"
                      defaultValue={dealer.contact_name ?? ""}
                      className="w-full min-w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {dealer.contact_email ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      form={formId}
                      name="contact_phone"
                      defaultValue={dealer.contact_phone ?? ""}
                      className="w-full min-w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        dealer.is_active
                          ? "text-xs font-medium text-emerald-400"
                          : "text-xs font-medium text-red-400"
                      }
                    >
                      {dealer.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">
                    {formatDate(dealer.created_at)}
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
                      <form action={setDealerActive}>
                        <input type="hidden" name="id" value={dealer.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={dealer.is_active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                        >
                          {dealer.is_active ? "Deactivate" : "Activate"}
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

      {dealers.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No dealer accounts yet.
        </p>
      ) : null}
    </div>
  );
}
