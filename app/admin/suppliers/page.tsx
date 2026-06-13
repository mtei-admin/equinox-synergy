import { SupplierCreateForm } from "@/components/admin/suppliers/supplier-create-form";
import { SupplierTable } from "@/components/admin/suppliers/supplier-table";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSuppliersPage() {
  await requireRole("employee");

  const supabase = await createClient();
  const { data: suppliers, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("AdminSuppliersPage", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Suppliers</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage vendor accounts for inbound purchasing and goods receipt.
        </p>
      </div>

      <SupplierCreateForm />
      <SupplierTable suppliers={suppliers ?? []} />
    </div>
  );
}
