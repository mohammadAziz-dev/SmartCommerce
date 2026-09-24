export type OrderStatus = 'CREATED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  businessId: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}
