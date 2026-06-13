import { AssetLibrary } from "@/components/dealer/asset-library";
import { createAssetSignedUrl } from "@/lib/cms/storage";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function DealerAssetsPage() {
  await requireRole("dealer");

  const supabase = await createClient();
  const { data: assets, error } = await supabase
    .from("cms_assets")
    .select("*")
    .eq("is_published", true)
    .eq("is_active", true)
    .order("title");

  if (error) {
    console.error("DealerAssetsPage", error);
  }

  const assetsWithUrls = await Promise.all(
    (assets ?? []).map(async (asset) => ({
      ...asset,
      downloadUrl: await createAssetSignedUrl(asset.storage_path),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Asset Library</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Download published manuals, labels, and marketing materials.
        </p>
      </div>

      <AssetLibrary assets={assetsWithUrls} />
    </div>
  );
}
