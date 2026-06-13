const LOW_STOCK_THRESHOLD = 10;

export type ProductRecord = {
  id: string;
  sku: string;
  name: string;
  supplier_cost: number;
  dealer_price: number;
  stock_quantity: number;
  is_active: boolean;
};

export type InventoryStats = {
  activeSkus: number;
  totalUnits: number;
  costValue: number;
  retailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export function isLowStock(quantity: number): boolean {
  return quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
}

export function computeInventoryStats(
  products: ProductRecord[],
): InventoryStats {
  const active = products.filter((product) => product.is_active);

  return {
    activeSkus: active.length,
    totalUnits: active.reduce((sum, product) => sum + product.stock_quantity, 0),
    costValue: active.reduce(
      (sum, product) => sum + product.supplier_cost * product.stock_quantity,
      0,
    ),
    retailValue: active.reduce(
      (sum, product) => sum + product.dealer_price * product.stock_quantity,
      0,
    ),
    lowStockCount: active.filter((product) =>
      isLowStock(product.stock_quantity),
    ).length,
    outOfStockCount: active.filter((product) => product.stock_quantity <= 0)
      .length,
  };
}

export const LOW_STOCK_THRESHOLD_VALUE = LOW_STOCK_THRESHOLD;
