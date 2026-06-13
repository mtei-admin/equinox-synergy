import { DealerCreateForm } from "@/components/admin/dealers/dealer-create-form";
import { DealerTable } from "@/components/admin/dealers/dealer-table";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDealersPage() {
  await requireRole("employee");

  const supabase = await createClient();
  const { data: dealers, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "dealer")
    .order("company_name");

  if (error) {
    console.error("AdminDealersPage", error);
  }

  const activeCount = (dealers ?? []).filter((dealer) => dealer.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dealer Accounts</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Onboard dealers, manage company profiles, and control portal access.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total dealers</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {(dealers ?? []).length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Active accounts</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeCount}</p>
        </div>
      </div>

      <DealerCreateForm />
      <DealerTable dealers={dealers ?? []} />
    </div>
  );
}
