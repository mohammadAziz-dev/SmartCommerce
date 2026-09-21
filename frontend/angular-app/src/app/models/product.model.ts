export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  sku: string | null;
  sellingPrice: number;
  category: string | null;
  active: boolean;
}

export interface ProductRequest {
  name: string;
  description: string | null;
  sku: string | null;
  sellingPrice: number;
  category: string | null;
  active: boolean;
}
