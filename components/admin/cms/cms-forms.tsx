"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  saveAnnouncement,
  uploadAsset,
  type CmsActionState,
} from "@/app/admin/cms/actions";
import { CMS_ASSET_CATEGORIES } from "@/lib/cms/constants";

const initialState: CmsActionState = {};

export function AssetUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadAsset,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Upload asset</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Files are stored in the private cms-assets bucket.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="asset-title" className="text-sm font-medium text-zinc-300">
            Title
          </label>
          <input
            id="asset-title"
            name="title"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="asset-category"
            className="text-sm font-medium text-zinc-300"
          >
            Category
          </label>
          <select
            id="asset-category"
            name="category"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          >
            <option value="">Uncategorized</option>
            {CMS_ASSET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="asset-file" className="text-sm font-medium text-zinc-300">
          File
        </label>
        <input
          id="asset-file"
          name="file"
          type="file"
          required
          className="text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="publish"
          type="checkbox"
          className="rounded border-zinc-600 bg-zinc-950"
        />
        Publish immediately for dealers
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Uploading..." : "Upload asset"}
      </button>
    </form>
  );
}

export function AnnouncementForm() {
  const [state, formAction, isPending] = useActionState(
    saveAnnouncement,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">New announcement</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Published announcements appear on the dealer dashboard.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="announcement-title" className="text-sm font-medium text-zinc-300">
          Title
        </label>
        <input
          id="announcement-title"
          name="title"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="announcement-body" className="text-sm font-medium text-zinc-300">
          Message
        </label>
        <textarea
          id="announcement-body"
          name="body"
          required
          rows={4}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="publish"
          type="checkbox"
          className="rounded border-zinc-600 bg-zinc-950"
        />
        Publish immediately
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save announcement"}
      </button>
    </form>
  );
}

export function CmsTabs({
  assetsPanel,
  announcementsPanel,
}: {
  assetsPanel: ReactNode;
  announcementsPanel: ReactNode;
}) {
  const [tab, setTab] = useState<"assets" | "announcements">("assets");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["assets", "announcements"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={
              tab === value
                ? "rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
                : "rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            }
          >
            {value === "assets" ? "Assets" : "Announcements"}
          </button>
        ))}
      </div>
      {tab === "assets" ? assetsPanel : announcementsPanel}
    </div>
  );
}
