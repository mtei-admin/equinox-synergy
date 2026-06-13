import Link from "next/link";
import { AnnouncementFeed } from "@/components/dealer/announcement-feed";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function DealerDashboardPage() {
  const session = await requireRole("dealer");
  const supabase = await createClient();

  const [
    { count: openOrders },
    { count: catalogItems },
    { count: publishedAssets },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "processing", "dispatched"]),
    supabase
      .from("products_dealer_catalog")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("cms_assets")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("is_active", true),
    supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const cards = [
    {
      label: "Open orders",
      value: openOrders ?? 0,
      href: "/dealer/orders",
    },
    {
      label: "Catalog items",
      value: catalogItems ?? 0,
      href: "/dealer/inventory",
    },
    {
      label: "Published assets",
      value: publishedAssets ?? 0,
      href: "/dealer/assets",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Browse inventory, submit purchase orders, and download CMS assets.
        </p>
      </div>

      <AnnouncementFeed announcements={announcements ?? []} />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/dealer/inventory"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Browse inventory
          </Link>
          <Link
            href="/dealer/orders"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            View orders
          </Link>
          <Link
            href="/dealer/assets"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Asset library
          </Link>
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        Signed in as {session.user.email ?? session.profile.contact_email}.
      </p>
    </div>
  );
}
