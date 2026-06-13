"use server";

import { revalidatePath } from "next/cache";
import { CMS_ASSETS_BUCKET } from "@/lib/cms/constants";
import { buildStoragePath } from "@/lib/cms/storage";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CmsActionState = {
  error?: string;
  success?: string;
};

function revalidateCmsPaths() {
  revalidatePath("/admin/cms");
  revalidatePath("/admin");
  revalidatePath("/dealer/assets");
  revalidatePath("/dealer");
}

export async function uploadAsset(
  _prevState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const session = await requireRole("employee");

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  const publish = formData.get("publish") === "on";
  const file = formData.get("file");

  if (!title) {
    return { error: "Title is required." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const supabase = await createClient();
  const storagePath = buildStoragePath(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(CMS_ASSETS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("uploadAsset storage", uploadError);
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("cms_assets").insert({
    title,
    category,
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type || null,
    uploaded_by: session.user.id,
    is_published: publish,
  });

  if (insertError) {
    console.error("uploadAsset insert", insertError);
    await supabase.storage.from(CMS_ASSETS_BUCKET).remove([storagePath]);
    return { error: insertError.message };
  }

  revalidateCmsPaths();
  return { success: publish ? "Asset uploaded and published." : "Asset uploaded as draft." };
}

export async function setAssetPublished(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  const isPublished = formData.get("is_published") === "true";

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cms_assets")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) {
    console.error("setAssetPublished", error);
    return;
  }

  revalidateCmsPaths();
}

export async function deactivateAsset(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cms_assets")
    .update({ is_active: false, is_published: false })
    .eq("id", id);

  if (error) {
    console.error("deactivateAsset", error);
    return;
  }

  revalidateCmsPaths();
}

export async function saveAnnouncement(
  _prevState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const session = await requireRole("employee");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publish = formData.get("publish") === "on";

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").insert({
    title,
    body,
    author_id: session.user.id,
    is_published: publish,
    published_at: publish ? new Date().toISOString() : null,
  });

  if (error) {
    console.error("saveAnnouncement", error);
    return { error: error.message };
  }

  revalidatePath("/admin/cms");
  revalidatePath("/dealer");
  return { success: publish ? "Announcement published." : "Announcement saved as draft." };
}

export async function setAnnouncementPublished(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  const isPublished = formData.get("is_published") === "true";

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    console.error("setAnnouncementPublished", error);
    return;
  }

  revalidatePath("/admin/cms");
  revalidatePath("/dealer");
}

export async function deactivateAnnouncement(formData: FormData) {
  await requireRole("employee");

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: false, is_published: false })
    .eq("id", id);

  if (error) {
    console.error("deactivateAnnouncement", error);
    return;
  }

  revalidatePath("/admin/cms");
  revalidatePath("/dealer");
}
