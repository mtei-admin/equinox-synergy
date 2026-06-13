import {
  deactivateAnnouncement,
  deactivateAsset,
  setAnnouncementPublished,
  setAssetPublished,
} from "@/app/admin/cms/actions";
import { formatDate } from "@/lib/format/display";
import type { Announcement, CmsAsset } from "@/lib/database.types";

type AssetManagerProps = {
  assets: CmsAsset[];
};

export function AssetManager({ assets }: AssetManagerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-950/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Title</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Category</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">File</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-4 py-4 font-medium text-white">{asset.title}</td>
                <td className="px-4 py-4 capitalize text-zinc-400">
                  {asset.category ?? "—"}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={
                      asset.is_published
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }
                  >
                    {asset.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-4 text-zinc-400">
                  {asset.file_name ?? asset.storage_path}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={setAssetPublished}>
                      <input type="hidden" name="id" value={asset.id} />
                      <input
                        type="hidden"
                        name="is_published"
                        value={asset.is_published ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                      >
                        {asset.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={deactivateAsset}>
                      <input type="hidden" name="id" value={asset.id} />
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
            ))}
          </tbody>
        </table>
      </div>
      {assets.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No assets uploaded yet.
        </p>
      ) : null}
    </div>
  );
}

type AnnouncementManagerProps = {
  announcements: Announcement[];
};

export function AnnouncementManager({
  announcements,
}: AnnouncementManagerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="divide-y divide-zinc-800">
        {announcements.map((announcement) => (
          <article key={announcement.id} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-white">{announcement.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">
                  {announcement.body}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {announcement.published_at
                    ? `Published ${formatDate(announcement.published_at)}`
                    : `Created ${formatDate(announcement.created_at)}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={
                    announcement.is_published
                      ? "text-xs font-medium text-emerald-400"
                      : "text-xs font-medium text-amber-400"
                  }
                >
                  {announcement.is_published ? "Published" : "Draft"}
                </span>
                <form action={setAnnouncementPublished}>
                  <input type="hidden" name="id" value={announcement.id} />
                  <input
                    type="hidden"
                    name="is_published"
                    value={announcement.is_published ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                  >
                    {announcement.is_published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deactivateAnnouncement}>
                  <input type="hidden" name="id" value={announcement.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10"
                  >
                    Archive
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
      {announcements.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No announcements yet.
        </p>
      ) : null}
    </div>
  );
}
