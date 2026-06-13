import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import {
  AnnouncementForm,
  AssetUploadForm,
  CmsTabs,
} from "@/components/admin/cms/cms-forms";
import {
  AnnouncementManager,
  AssetManager,
} from "@/components/admin/cms/cms-manager";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCmsPage() {
  await requireRole("employee");

  const supabase = await createClient();

  const [{ data: assets }, { data: announcements }] = await Promise.all([
    supabase
      .from("cms_assets")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">CMS Management</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upload dealer-facing files and publish company announcements.
        </p>
      </div>

      <CmsTabs
        assetsPanel={
          <div className="space-y-6">
            <AssetUploadForm />
            <AssetManager assets={assets ?? []} />
          </div>
        }
        announcementsPanel={
          <div className="space-y-6">
            <AnnouncementForm />
            <AnnouncementManager announcements={announcements ?? []} />
          </div>
        }
      />

      <p className="text-sm text-zinc-500">
        Dealers access published content from{" "}
        <Link href="/dealer/assets" className="text-zinc-300 underline">
          /dealer/assets
        </Link>
        .
      </p>
    </div>
  );
}
