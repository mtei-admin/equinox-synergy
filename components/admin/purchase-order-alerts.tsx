"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format/display";
import {
  ADMIN_PO_CHANNEL,
  isPurchaseOrderInsertPayload,
  type PurchaseOrderInsertPayload,
} from "@/lib/realtime/purchase-orders";
import { createClient } from "@/lib/supabase/client";

type AlertItem = PurchaseOrderInsertPayload & {
  alertId: string;
};

export function PurchaseOrderAlerts() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(ADMIN_PO_CHANNEL)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "purchase_orders",
        },
        (payload) => {
          if (!isPurchaseOrderInsertPayload(payload.new)) {
            return;
          }

          const order = payload.new;

          setAlerts((current) => {
            const nextAlert: AlertItem = {
              id: order.id,
              order_number: order.order_number,
              total_amount: order.total_amount,
              status: order.status,
              created_at: order.created_at,
              dealer_id: order.dealer_id,
              alertId: crypto.randomUUID(),
            };

            return [nextAlert, ...current].slice(0, 5);
          });

          router.refresh();
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  function dismissAlert(alertId: string) {
    setAlerts((current) =>
      current.filter((alert) => alert.alertId !== alertId),
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.alertId}
            className="rounded-xl border border-emerald-500/40 bg-zinc-900 p-4 shadow-lg shadow-black/40"
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  New purchase order
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {alert.order_number}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatCurrency(alert.total_amount)} · {alert.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissAlert(alert.alertId)}
                className="text-zinc-500 transition hover:text-zinc-300"
                aria-label="Dismiss alert"
              >
                ×
              </button>
            </div>
            <Link
              href={`/admin/orders`}
              className="mt-3 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Review in fulfillment →
            </Link>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
        <span
          className={
            isConnected
              ? "inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/95 px-3 py-1.5 text-xs text-emerald-300"
              : "inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/95 px-3 py-1.5 text-xs text-zinc-400"
          }
        >
          <span
            className={
              isConnected
                ? "h-2 w-2 rounded-full bg-emerald-400"
                : "h-2 w-2 rounded-full bg-zinc-500"
            }
          />
          {isConnected ? "PO alerts live" : "Connecting PO alerts…"}
        </span>
      </div>
    </>
  );
}
