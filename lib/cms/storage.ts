import { CMS_ASSETS_BUCKET, SIGNED_URL_TTL_SECONDS } from "@/lib/cms/constants";
import { createClient } from "@/lib/supabase/server";

export async function createAssetSignedUrl(storagePath: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(CMS_ASSETS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("createAssetSignedUrl", error);
    return null;
  }

  return data.signedUrl;
}

export function sanitizeStorageFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildStoragePath(fileName: string): string {
  return `assets/${crypto.randomUUID()}-${sanitizeStorageFileName(fileName)}`;
}
