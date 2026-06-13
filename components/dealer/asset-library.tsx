import { formatDate } from "@/lib/format/display";
import type { CmsAsset } from "@/lib/database.types";

export type DealerAsset = CmsAsset & {
  downloadUrl: string | null;
};

type AssetLibraryProps = {
  assets: DealerAsset[];
};

export function AssetLibrary({ assets }: AssetLibraryProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 shadow-sm">
        No published assets are available yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">
                Category
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">
                Updated
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-600">
                Download
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-4 py-4">
                  <p className="font-medium text-zinc-900">{asset.title}</p>
                  {asset.file_name ? (
                    <p className="mt-1 text-xs text-zinc-500">{asset.file_name}</p>
                  ) : null}
                </td>
                <td className="px-4 py-4 capitalize text-zinc-600">
                  {asset.category ?? "General"}
                </td>
                <td className="px-4 py-4 text-zinc-600">
                  {formatDate(asset.updated_at)}
                </td>
                <td className="px-4 py-4 text-right">
                  {asset.downloadUrl ? (
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400">Unavailable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
