import { createContext } from "react";
import type { CartItem } from "../models/CartItem";
import type { Product } from "../models/Product";

export interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalQuantity: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined,
);
