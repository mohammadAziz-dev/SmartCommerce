export interface Inventory {
  id: string;
  businessId: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
}

export interface CreateInventoryRequest {
  productId: string;
  quantity: number;
  lowStockThreshold: number;
}

export interface StockAdjustmentRequest {
  amount: number;
}
