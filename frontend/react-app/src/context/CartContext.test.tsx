import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CartProvider } from "./CartContext";
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

const inactiveProduct: Product = {
  ...product,
  id: "product-2",
  name: "Inactive Mouse",
  active: false,
};

function TestCart() {
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalQuantity,
    totalPrice,
  } = useCart();

  return (
    <>
      <button type="button" onClick={() => addItem(product)}>
        Add product
      </button>

      <button type="button" onClick={() => addItem(inactiveProduct)}>
        Add inactive product
      </button>

      <button type="button" onClick={() => updateQuantity(product.id, 3)}>
        Set quantity to 3
      </button>

      <button type="button" onClick={() => updateQuantity(product.id, 0)}>
        Set quantity to 0
      </button>

      <button type="button" onClick={() => updateQuantity(product.id, 2.5)}>
        Set invalid quantity
      </button>

      <button type="button" onClick={() => removeItem(product.id)}>
        Remove product
      </button>

      <button type="button" onClick={clearCart}>
        Clear cart
      </button>

      <span>Cart items: {items.length}</span>
      <span>Quantity: {items.length > 0 ? items[0].quantity : 0}</span>
      <span>Total quantity: {totalQuantity}</span>
      <span>Total price: {totalPrice.toFixed(2)}</span>
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe("CartContext", () => {
  it("adds a product to the cart", async () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    expect(screen.getByText("Cart items: 0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Cart items: 1")).toBeInTheDocument();
  });

  it("increases quantity when the same product is added again", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    const addButton = screen.getByRole("button", {
      name: "Add product",
    });

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByText("Cart items: 1")).toBeInTheDocument();
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
  });

  it("updates the quantity of a cart item", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(screen.getByRole("button", { name: "Set quantity to 3" }));

    expect(screen.getByText("Quantity: 3")).toBeInTheDocument();
  });

  it("removes a product from the cart", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Cart items: 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove product" }));

    expect(screen.getByText("Cart items: 0")).toBeInTheDocument();
  });

  it("clears all items from the cart", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    const addButton = screen.getByRole("button", {
      name: "Add product",
    });

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByText("Cart items: 1")).toBeInTheDocument();
    expect(screen.getByText("Total quantity: 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear cart" }));

    expect(screen.getByText("Cart items: 0")).toBeInTheDocument();
    expect(screen.getByText("Total quantity: 0")).toBeInTheDocument();
    expect(screen.getByText("Total price: 0.00")).toBeInTheDocument();
  });

  it("does not add an inactive product to the cart", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add inactive product" }),
    );

    expect(screen.getByText("Cart items: 0")).toBeInTheDocument();
  });

  it("does not accept a non-integer quantity", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Quantity: 1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Set invalid quantity" }),
    );

    expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
  });

  it("removes the product when quantity is set to 0", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Cart items: 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set quantity to 0" }));

    expect(screen.getByText("Cart items: 0")).toBeInTheDocument();
  });

  it("calculates total quantity and total price", () => {
    render(
      <CartProvider>
        <TestCart />
      </CartProvider>,
    );

    const addButton = screen.getByRole("button", {
      name: "Add product",
    });

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByText("Total quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("Total price: 79.98")).toBeInTheDocument();
  });
});
