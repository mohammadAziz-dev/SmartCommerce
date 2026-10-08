export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  sku: string;
  sellingPrice: number;
  category: string;
  active: boolean;
}
