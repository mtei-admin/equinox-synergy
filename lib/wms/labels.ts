import type { Database } from "@/lib/database.types";

type EnumName = keyof Database["public"]["Enums"];

export const PURCHASE_REQUEST_STATUS_LABELS: Record<
  Database["public"]["Enums"]["purchase_request_status"],
  string
> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  converted: "Converted",
  cancelled: "Cancelled",
};

export const SUPPLIER_ORDER_STATUS_LABELS: Record<
  Database["public"]["Enums"]["supplier_order_status"],
  string
> = {
  draft: "Draft",
  sent: "Sent",
  partially_received: "Partially received",
  received: "Received",
  cancelled: "Cancelled",
};

export const GOODS_RECEIPT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["goods_receipt_status"],
  string
> = {
  draft: "Draft",
  validated: "Validated",
  posted: "Posted",
  exception: "Exception",
  cancelled: "Cancelled",
};

export const DELIVERY_RECEIPT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["delivery_receipt_status"],
  string
> = {
  draft: "Draft",
  authorized: "Authorized",
  picking: "Picking",
  picked: "Picked",
  loaded: "Loaded",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const SALES_INVOICE_STATUS_LABELS: Record<
  Database["public"]["Enums"]["sales_invoice_status"],
  string
> = {
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  void: "Void",
};

export const OUTBOUND_SHIPMENT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["outbound_shipment_status"],
  string
> = {
  scheduled: "Scheduled",
  loaded: "Loaded",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function enumOptions<T extends string>(
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}
