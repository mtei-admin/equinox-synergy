"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type FulfillmentActionState = {
  error?: string;
  success?: string;
};

function revalidateFulfillment(orderId: string) {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/fulfillment");
  revalidatePath("/admin/inventory");
  revalidatePath("/dealer/orders");
  revalidatePath(`/dealer/orders/${orderId}`);
}

async function nextDocNumber(prefix: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_document_number", {
    prefix,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to generate document number.");
  }

  return data;
}

export async function createSalesInvoice(formData: FormData) {
  const session = await requireRole("employee");
  const orderId = String(formData.get("order_id") ?? "");
  if (!orderId) return;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("purchase_orders")
    .select("total_amount")
    .eq("id", orderId)
    .single();

  if (!order) return;

  const invoiceNumber = await nextDocNumber("INV");
  const { error } = await supabase.from("sales_invoices").insert({
    purchase_order_id: orderId,
    invoice_number: invoiceNumber,
    amount: order.total_amount,
    status: "issued",
    issued_at: new Date().toISOString(),
    created_by: session.user.id,
  });

  if (error) {
    console.error("createSalesInvoice", error);
    return;
  }

  await supabase
    .from("purchase_orders")
    .update({ status: "processing" })
    .eq("id", orderId)
    .eq("status", "pending");

  revalidateFulfillment(orderId);
}

export async function createDeliveryReceipt(formData: FormData) {
  const session = await requireRole("employee");
  const orderId = String(formData.get("order_id") ?? "");
  if (!orderId) return;

  const supabase = await createClient();
  const drNumber = await nextDocNumber("DR");

  const { error } = await supabase.from("delivery_receipts").insert({
    purchase_order_id: orderId,
    dr_number: drNumber,
    status: "authorized",
    authorized_by: session.user.id,
    authorized_at: new Date().toISOString(),
  });

  if (error) {
    console.error("createDeliveryReceipt", error);
    return;
  }

  revalidateFulfillment(orderId);
}

export async function createPickList(formData: FormData) {
  await requireRole("employee");

  const orderId = String(formData.get("order_id") ?? "");
  const deliveryReceiptId = String(formData.get("delivery_receipt_id") ?? "");
  if (!orderId || !deliveryReceiptId) return;

  const supabase = await createClient();
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("id, product_id, quantity")
    .eq("purchase_order_id", orderId);

  if (itemsError || !orderItems?.length) {
    console.error("createPickList items", itemsError);
    return;
  }

  const { data: pickList, error: pickError } = await supabase
    .from("pick_lists")
    .insert({
      delivery_receipt_id: deliveryReceiptId,
      status: "open",
    })
    .select("id")
    .single();

  if (pickError || !pickList) {
    console.error("createPickList", pickError);
    return;
  }

  const { error: linesError } = await supabase.from("pick_list_lines").insert(
    orderItems.map((item) => ({
      pick_list_id: pickList.id,
      order_item_id: item.id,
      product_id: item.product_id,
      quantity_requested: item.quantity,
      quantity_picked: item.quantity,
    })),
  );

  if (linesError) {
    console.error("createPickList lines", linesError);
    return;
  }

  await supabase
    .from("delivery_receipts")
    .update({ status: "picking" })
    .eq("id", deliveryReceiptId);

  revalidateFulfillment(orderId);
}

export async function postPickList(formData: FormData) {
  await requireRole("employee");

  const orderId = String(formData.get("order_id") ?? "");
  const pickListId = String(formData.get("pick_list_id") ?? "");
  const deliveryReceiptId = String(formData.get("delivery_receipt_id") ?? "");
  if (!orderId || !pickListId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("post_pick_list", {
    p_pick_list_id: pickListId,
  });

  if (error) {
    console.error("postPickList", error);
    return;
  }

  if (deliveryReceiptId) {
    await supabase
      .from("delivery_receipts")
      .update({ status: "picked" })
      .eq("id", deliveryReceiptId);
  }

  revalidateFulfillment(orderId);
}

export async function createOutboundShipment(formData: FormData) {
  await requireRole("employee");

  const orderId = String(formData.get("order_id") ?? "");
  const deliveryReceiptId = String(formData.get("delivery_receipt_id") ?? "");
  if (!orderId || !deliveryReceiptId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("outbound_shipments").insert({
    delivery_receipt_id: deliveryReceiptId,
    status: "scheduled",
    trucker_name: String(formData.get("trucker_name") ?? "").trim() || null,
    vehicle_plate: String(formData.get("vehicle_plate") ?? "").trim() || null,
    driver_phone: String(formData.get("driver_phone") ?? "").trim() || null,
    route_notes: String(formData.get("route_notes") ?? "").trim() || null,
  });

  if (error) {
    console.error("createOutboundShipment", error);
    return;
  }

  await supabase
    .from("delivery_receipts")
    .update({ status: "loaded" })
    .eq("id", deliveryReceiptId);

  revalidateFulfillment(orderId);
}

export async function dispatchShipment(formData: FormData) {
  await requireRole("employee");

  const orderId = String(formData.get("order_id") ?? "");
  const shipmentId = String(formData.get("shipment_id") ?? "");
  const deliveryReceiptId = String(formData.get("delivery_receipt_id") ?? "");
  if (!orderId || !shipmentId) return;

  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from("outbound_shipments")
    .update({
      status: "in_transit",
      dispatched_at: now,
    })
    .eq("id", shipmentId);

  if (deliveryReceiptId) {
    await supabase
      .from("delivery_receipts")
      .update({ status: "dispatched" })
      .eq("id", deliveryReceiptId);
  }

  await supabase
    .from("purchase_orders")
    .update({ status: "dispatched" })
    .eq("id", orderId);

  revalidateFulfillment(orderId);
}

export async function recordProofOfDelivery(formData: FormData) {
  const session = await requireRole("employee");

  const orderId = String(formData.get("order_id") ?? "");
  const shipmentId = String(formData.get("shipment_id") ?? "");
  const deliveryReceiptId = String(formData.get("delivery_receipt_id") ?? "");
  const signedBy = String(formData.get("signed_by") ?? "").trim();

  if (!orderId || !shipmentId || !signedBy) return;

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("proof_of_deliveries").insert({
    outbound_shipment_id: shipmentId,
    signed_by: signedBy,
    signed_at: now,
    notes: String(formData.get("notes") ?? "").trim() || null,
    recorded_by: session.user.id,
  });

  if (error) {
    console.error("recordProofOfDelivery", error);
    return;
  }

  await supabase
    .from("outbound_shipments")
    .update({ status: "delivered", delivered_at: now })
    .eq("id", shipmentId);

  if (deliveryReceiptId) {
    await supabase
      .from("delivery_receipts")
      .update({ status: "delivered" })
      .eq("id", deliveryReceiptId);
  }

  await supabase
    .from("purchase_orders")
    .update({ status: "completed" })
    .eq("id", orderId);

  revalidateFulfillment(orderId);
}
