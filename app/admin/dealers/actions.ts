"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type DealerActionState = {
  error?: string;
  success?: string;
};

function revalidateDealerPaths() {
  revalidatePath("/admin/dealers");
  revalidatePath("/admin");
}

export async function createDealerAccount(
  _prevState: DealerActionState,
  formData: FormData,
): Promise<DealerActionState> {
  await requireRole("employee");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("company_name") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const contactPhone = String(formData.get("contact_phone") ?? "").trim() || null;

  if (!email || !password || !companyName || !contactName) {
    return {
      error: "Email, password, company name, and contact name are required.",
    };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const admin = createAdminClient();

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !created.user) {
      console.error("createDealerAccount auth", createError);
      return { error: createError?.message ?? "Unable to create dealer account." };
    }

    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: created.user.id,
          role: "dealer",
          company_name: companyName,
          contact_name: contactName,
          contact_email: email,
          contact_phone: contactPhone,
          is_active: true,
        },
        { onConflict: "id" },
      );

    if (profileError) {
      console.error("createDealerAccount profile", profileError);
      await admin.auth.admin.deleteUser(created.user.id);
      return { error: profileError.message };
    }

    revalidateDealerPaths();
    return { success: `Dealer account created for ${email}.` };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to create dealer account.",
    };
  }
}

export async function setDealerActive(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("role", "dealer");

  if (error) {
    console.error("setDealerActive", error);
    return;
  }

  revalidateDealerPaths();
}

export async function updateDealerProfile(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const companyName = String(formData.get("company_name") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const contactPhone = String(formData.get("contact_phone") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      company_name: companyName,
      contact_name: contactName,
      contact_phone: contactPhone,
    })
    .eq("id", id)
    .eq("role", "dealer");

  if (error) {
    console.error("updateDealerProfile", error);
    return;
  }

  revalidateDealerPaths();
}
