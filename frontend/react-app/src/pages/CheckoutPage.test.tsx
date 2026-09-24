import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "../models/Product";
import { useCart } from "../hooks/useCart";
import { CheckoutPage } from "./CheckoutPage";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import { placeOrder } from "../api/ordersApi";

vi.mock("../api/ordersApi", () => ({
  placeOrder: vi.fn(),
}));

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

function CheckoutTestSetup() {
  const { addItem, totalQuantity } = useCart();

  return (
    <>
      <button type="button" onClick={() => addItem(product)}>
        Add product
      </button>

      <span>Cart quantity: {totalQuantity}</span>

      <CheckoutPage />
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe("CheckoutPage", () => {
  it("shows cart items and estimated total", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutTestSetup />
        </CartProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Gaming Mouse × 1 — €39.99")).toBeInTheDocument();
    expect(screen.getByText("Estimated total: €39.99")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Place order" }),
    ).toBeInTheDocument();
  });

  it("shows confirmation after a successful order and clears the cart", async () => {
    const mockedPlaceOrder = vi.mocked(placeOrder);

    mockedPlaceOrder.mockResolvedValue({
      id: "order-1",
      businessId: "business-1",
      status: "CREATED",
      totalPrice: 39.99,
      items: [
        {
          productId: "product-1",
          productName: "Gaming Mouse",
          quantity: 1,
          unitPrice: 39.99,
          subtotal: 39.99,
        },
      ],
    });

    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutTestSetup />
        </CartProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Cart quantity: 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    expect(
      await screen.findByRole("heading", { name: "Order confirmed" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Cart quantity: 0")).toBeInTheDocument();
    expect(screen.getByText("Order ID:")).toBeInTheDocument();
    expect(screen.getByText("order-1")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("CREATED")).toBeInTheDocument();
    expect(screen.getByText("Total: €39.99")).toBeInTheDocument();
  });

  it("shows an error and keeps the cart when order placement fails", async () => {
    const mockedPlaceOrder = vi.mocked(placeOrder);

    mockedPlaceOrder.mockRejectedValue(
      new Error("Failed to place order (400)"),
    );

    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutTestSetup />
        </CartProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    expect(screen.getByText("Cart quantity: 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not place your order. Please try again.",
    );

    expect(screen.getByText("Cart quantity: 1")).toBeInTheDocument();
  });

  it("disables the place order button while submitting", async () => {
    const mockedPlaceOrder = vi.mocked(placeOrder);

    mockedPlaceOrder.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutTestSetup />
        </CartProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    const submittingButton = await screen.findByRole("button", {
      name: "Placing order...",
    });

    expect(submittingButton).toBeDisabled();
  });
});
