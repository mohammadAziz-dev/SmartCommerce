import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductCard from "./ProductCard";
import type { Product } from "../models/Product";
import { CartProvider } from "../context/CartContext";

const product: Product = {
  id: "product-1",
  businessId: "business-1",
  name: "Gaming Mouse",
  description: "Wireless gaming mouse",
  sku: "MOUSE-001",
  sellingPrice: 29.99,
  category: "Electronics",
  active: true,
};

describe("ProductCard", () => {
  it("displays the product information", () => {
    render(
      <CartProvider>
        <ProductCard product={product} />
      </CartProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Gaming Mouse" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Wireless gaming mouse")).toBeInTheDocument();
    expect(screen.getByText("€29.99")).toBeInTheDocument();
  });
});
