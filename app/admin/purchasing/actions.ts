"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type PurchasingActionState = {
  error?: string;
  success?: string;
};

function revalidatePurchasing() {
  revalidatePath("/admin/purchasing");
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
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

function parsePositiveInt(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  return Math.floor(parsed);
}

export async function submitPurchaseRequest(formData: FormData): Promise<void> {
  await createPurchaseRequest({}, formData);
}

export async function createPurchaseRequest(
  _prev: PurchasingActionState,
  formData: FormData,
): Promise<PurchasingActionState> {
  const session = await requireRole("employee");

  const productId = String(formData.get("product_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!productId) {
    return { error: "Select a product for the purchase request." };
  }

  try {
    const quantity = parsePositiveInt(
      formData.get("quantity_requested"),
      "Quantity",
    );
    const supabase = await createClient();
    const prNumber = await nextDocNumber("PR");

    const { data: pr, error: prError } = await supabase
      .from("purchase_requests")
      .insert({
        pr_number: prNumber,
        requested_by: session.user.id,
        status: "submitted",
        notes,
      })
      .select("id")
      .single();

    if (prError || !pr) {
      return { error: prError?.message ?? "Unable to create purchase request." };
    }

    const { error: lineError } = await supabase
      .from("purchase_request_lines")
      .insert({
        purchase_request_id: pr.id,
        product_id: productId,
        quantity_requested: quantity,
      });

    if (lineError) {
      return { error: lineError.message };
    }

    revalidatePurchasing();
    return { success: `Purchase request ${prNumber} submitted.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create PR.",
    };
  }
}

export async function approvePurchaseRequest(formData: FormData) {
  const session = await requireRole("employee");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_requests")
    .update({
      status: "approved",
      approved_by: session.user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "submitted");

  if (error) {
    console.error("approvePurchaseRequest", error);
    return;
  }

  revalidatePurchasing();
}

export async function createSupplierPurchaseOrder(formData: FormData) {
  await requireRole("employee");

  const supplierId = String(formData.get("supplier_id") ?? "");
  const purchaseRequestId =
    String(formData.get("purchase_request_id") ?? "").trim() || null;
  const productId = String(formData.get("product_id") ?? "");

  if (!supplierId || !productId) {
    return;
  }

  try {
    const quantity = parsePositiveInt(formData.get("quantity_ordered"), "Quantity");
    const unitCost = Number(formData.get("unit_cost") ?? 0);
    const supabase = await createClient();
    const spoNumber = await nextDocNumber("SPO");

    const { data: spo, error: spoError } = await supabase
      .from("supplier_purchase_orders")
      .insert({
        spo_number: spoNumber,
        supplier_id: supplierId,
        purchase_request_id: purchaseRequestId,
        status: "sent",
        total_amount: quantity * unitCost,
      })
      .select("id")
      .single();

    if (spoError || !spo) {
      console.error("createSupplierPurchaseOrder", spoError);
      return;
    }

    const { error: lineError } = await supabase.from("supplier_order_lines").insert({
      supplier_purchase_order_id: spo.id,
      product_id: productId,
      quantity_ordered: quantity,
      unit_cost: unitCost,
    });

    if (lineError) {
      console.error("createSupplierPurchaseOrder line", lineError);
      return;
    }

    if (purchaseRequestId) {
      await supabase
        .from("purchase_requests")
        .update({ status: "converted" })
        .eq("id", purchaseRequestId);
    }

    revalidatePurchasing();
  } catch (error) {
    console.error("createSupplierPurchaseOrder", error);
  }
}

export async function createGoodsReceipt(formData: FormData) {
  await requireRole("employee");

  const supplierPurchaseOrderId = String(
    formData.get("supplier_purchase_order_id") ?? "",
  );
  const productId = String(formData.get("product_id") ?? "");

  if (!supplierPurchaseOrderId || !productId) {
    return;
  }

  try {
    const quantityReceived = parsePositiveInt(
      formData.get("quantity_received"),
      "Quantity received",
    );
    const quantityAccepted = parsePositiveInt(
      formData.get("quantity_accepted"),
      "Quantity accepted",
    );
    const quantityRejected = Math.max(0, quantityReceived - quantityAccepted);

    const supabase = await createClient();
    const receiptNumber = await nextDocNumber("GR");

    const { data: receipt, error: receiptError } = await supabase
      .from("goods_receipts")
      .insert({
        receipt_number: receiptNumber,
        supplier_purchase_order_id: supplierPurchaseOrderId,
        status: "validated",
        received_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (receiptError || !receipt) {
      console.error("createGoodsReceipt", receiptError);
      return;
    }

    const { data: orderLine } = await supabase
      .from("supplier_order_lines")
      .select("id")
      .eq("supplier_purchase_order_id", supplierPurchaseOrderId)
      .eq("product_id", productId)
      .maybeSingle();

    const { error: lineError } = await supabase.from("goods_receipt_lines").insert({
      goods_receipt_id: receipt.id,
      supplier_order_line_id: orderLine?.id ?? null,
      product_id: productId,
      quantity_received: quantityReceived,
      quantity_accepted: quantityAccepted,
      quantity_rejected: quantityRejected,
      condition: quantityRejected > 0 ? "damaged" : "ok",
    });

    if (lineError) {
      console.error("createGoodsReceipt line", lineError);
      return;
    }

    if (quantityRejected > 0) {
      const { data: receiptLine } = await supabase
        .from("goods_receipt_lines")
        .select("id")
        .eq("goods_receipt_id", receipt.id)
        .single();

      if (receiptLine) {
        await supabase.from("receipt_exceptions").insert({
          goods_receipt_line_id: receiptLine.id,
          exception_type: "damage",
          quantity_affected: quantityRejected,
          notes: "Recorded during goods receipt validation",
        });
      }
    }

    revalidatePurchasing();
  } catch (error) {
    console.error("createGoodsReceipt", error);
  }
}

export async function postGoodsReceipt(formData: FormData) {
  await requireRole("employee");

  const receiptId = String(formData.get("receipt_id") ?? "");
  if (!receiptId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("post_goods_receipt", {
    p_receipt_id: receiptId,
  });

  if (error) {
    console.error("postGoodsReceipt", error);
    return;
  }

  revalidatePurchasing();
}
