import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "../context/CartContext";
import type { CartItem } from "../models/CartItem";
import { CartItemRow } from "./CartItemRow";

const item: CartItem = {
  product: {
    id: "product-1",
    businessId: "business-1",
    name: "Gaming Mouse",
    description: "Wireless gaming mouse",
    sku: "MOUSE-001",
    sellingPrice: 39.99,
    category: "Gaming",
    active: true,
  },
  quantity: 2,
};

describe("CartItemRow", () => {
  it("shows the product and quantity", () => {
    render(
      <CartProvider>
        <CartItemRow item={item} />
      </CartProvider>,
    );

    expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
