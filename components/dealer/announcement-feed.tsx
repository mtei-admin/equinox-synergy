import { formatDate } from "@/lib/format/display";
import type { Announcement } from "@/lib/database.types";

type AnnouncementFeedProps = {
  announcements: Announcement[];
};

export function AnnouncementFeed({ announcements }: AnnouncementFeedProps) {
  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Company announcements
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          No announcements have been published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">
        Company announcements
      </h2>
      <div className="mt-4 space-y-4">
        {announcements.map((announcement) => (
          <article
            key={announcement.id}
            className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0"
          >
            <h3 className="font-medium text-zinc-900">{announcement.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">
              {announcement.body}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {announcement.published_at
                ? formatDate(announcement.published_at)
                : formatDate(announcement.created_at)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
