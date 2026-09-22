import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartProvider } from "../context/CartContext";
import { CartPage } from "./CartPage";
import { useCart } from "../hooks/useCart";
import type { Product } from "../models/Product";

const product: Product = {
  id: "product-1",
  businessId: "business-1",
  name: "Gaming Mouse",
  description: "Wireless gaming mouse",
  sku: "MOUSE-001",
  sellingPrice: 39.99,
  category: "Gaming",
  active: true,
};

function AddProductButton() {
  const { addItem } = useCart();

  return (
    <button type="button" onClick={() => addItem(product)}>
      Add product
    </button>
  );
}

describe("CartPage", () => {
  it("shows an empty cart message when the cart has no items", () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>,
    );

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("shows cart items and totals", () => {
    render(
      <CartProvider>
        <AddProductButton />
        <CartPage />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
    expect(screen.getByText("Total items: 1")).toBeInTheDocument();
    expect(screen.getByText("Total: €39.99")).toBeInTheDocument();
  });
});
