"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { generateOrderNumber } from "@/lib/orders/helpers";
import { createClient } from "@/lib/supabase/server";

export type SubmitOrderState = {
  error?: string;
  success?: string;
  orderId?: string;
};

type CartLineInput = {
  productId: string;
  quantity: number;
};

export async function submitPurchaseOrder(
  _prevState: SubmitOrderState,
  formData: FormData,
): Promise<SubmitOrderState> {
  const session = await requireRole("dealer");
  const rawItems = formData.get("items");

  if (typeof rawItems !== "string" || !rawItems) {
    return { error: "Your cart is empty." };
  }

  let cartLines: CartLineInput[];

  try {
    cartLines = JSON.parse(rawItems) as CartLineInput[];
  } catch {
    return { error: "Invalid cart data. Please refresh and try again." };
  }

  const normalizedLines = cartLines.filter(
    (line) => line.productId && line.quantity > 0,
  );

  if (normalizedLines.length === 0) {
    return { error: "Add at least one product before submitting." };
  }

  const supabase = await createClient();
  const productIds = normalizedLines.map((line) => line.productId);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, dealer_price, stock_quantity")
    .eq("is_active", true)
    .in("id", productIds);

  if (productsError) {
    console.error("submitPurchaseOrder products", productsError);
    return { error: "Unable to load product pricing." };
  }

  const productMap = new Map(
    (products ?? []).map((product) => [product.id, product]),
  );

  const orderLines: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[] = [];

  for (const line of normalizedLines) {
    const product = productMap.get(line.productId);

    if (!product?.dealer_price) {
      return { error: "One or more products are no longer available." };
    }

    if ((product.stock_quantity ?? 0) < line.quantity) {
      return {
        error: `${product.name ?? "A product"} is not available in the requested quantity.`,
      };
    }

    orderLines.push({
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: product.dealer_price,
    });
  }

  const totalAmount = orderLines.reduce(
    (sum, line) => sum + line.quantity * line.unit_price,
    0,
  );

  const { data: purchaseOrder, error: orderError } = await supabase
    .from("purchase_orders")
    .insert({
      order_number: generateOrderNumber(),
      dealer_id: session.user.id,
      total_amount: totalAmount,
      status: "pending",
    })
    .select("id, order_number")
    .single();

  if (orderError || !purchaseOrder) {
    console.error("submitPurchaseOrder order", orderError);
    return { error: "Unable to create purchase order." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderLines.map((line) => ({
      purchase_order_id: purchaseOrder.id,
      product_id: line.product_id,
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
  );

  if (itemsError) {
    console.error("submitPurchaseOrder items", itemsError);
    return { error: "Unable to save order line items." };
  }

  revalidatePath("/dealer");
  revalidatePath("/dealer/orders");
  revalidatePath("/admin/orders");

  return {
    success: `Purchase order ${purchaseOrder.order_number} submitted.`,
    orderId: purchaseOrder.id,
  };
}
