"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SupplierActionState = {
  error?: string;
  success?: string;
};

function revalidateSuppliers() {
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/purchasing");
}

export async function createSupplier(
  _prev: SupplierActionState,
  formData: FormData,
): Promise<SupplierActionState> {
  await requireRole("employee");

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    return { error: "Supplier code and name are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    code,
    name,
    contact_name: String(formData.get("contact_name") ?? "").trim() || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
  });

  if (error) {
    console.error("createSupplier", error);
    return { error: error.message };
  }

  revalidateSuppliers();
  return { success: `Supplier ${code} added.` };
}

export async function updateSupplier(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      contact_name: String(formData.get("contact_name") ?? "").trim() || null,
      contact_email: String(formData.get("contact_email") ?? "").trim() || null,
      contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateSupplier", error);
    return;
  }

  revalidateSuppliers();
}

export async function deactivateSupplier(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("deactivateSupplier", error);
    return;
  }

  revalidateSuppliers();
}
