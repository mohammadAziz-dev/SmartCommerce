import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "../models/Product";
import { useCart } from "../hooks/useCart";
import { CheckoutPage } from "./CheckoutPage";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import { completeCheckout, createPayment } from "../api/paymentApi";

vi.mock("../api/paymentApi", () => ({
  createPayment: vi.fn(),
  completeCheckout: vi.fn(),
}));

vi.mock("../components/PaymentForm", () => ({
  default: ({
    onPaymentSuccess,
  }: {
    onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  }) => (
    <button type="button" onClick={() => onPaymentSuccess("pi_test_123")}>
      Complete test payment
    </button>
  ),
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
      screen.getByRole("button", { name: "Continue to payment" }),
    ).toBeInTheDocument();
  });

  it("starts payment when customer continues to payment", async () => {
    const mockedCreatePayment = vi.mocked(createPayment);

    mockedCreatePayment.mockResolvedValue({
      clientSecret: "test-client-secret",
    });

    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutTestSetup />
        </CartProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    expect(mockedCreatePayment).toHaveBeenCalledWith(
      import.meta.env.VITE_BUSINESS_ID,
      {
        items: [
          {
            productId: "product-1",
            quantity: 1,
          },
        ],
      },
    );
  });

  it("shows an error and keeps the cart when payment cannot start", async () => {
    const mockedCreatePayment = vi.mocked(createPayment);

    mockedCreatePayment.mockRejectedValue(
      new Error("Failed to create payment (400)"),
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

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not start payment. Please try again.",
    );

    expect(screen.getByText("Cart quantity: 1")).toBeInTheDocument();
  });

  it("shows confirmation after successful payment and clears the cart", async () => {
    vi.mocked(createPayment).mockResolvedValue({
      clientSecret: "test-client-secret",
    });

    vi.mocked(completeCheckout).mockResolvedValue({
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

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Complete test payment",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Order confirmed" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Cart quantity: 0")).toBeInTheDocument();
    expect(screen.getByText("order-1")).toBeInTheDocument();
    expect(screen.getByText("CREATED")).toBeInTheDocument();
    expect(screen.getByText("Total: €39.99")).toBeInTheDocument();

    expect(completeCheckout).toHaveBeenCalledWith(
      import.meta.env.VITE_BUSINESS_ID,
      {
        paymentIntentId: "pi_test_123",
        items: [
          {
            productId: "product-1",
            quantity: 1,
          },
        ],
      },
    );
  });

  it("disables the continue to payment button while preparing payment", async () => {
    vi.mocked(createPayment).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutTestSetup />
        </CartProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    const submittingButton = await screen.findByRole("button", {
      name: "Preparing payment...",
    });

    expect(submittingButton).toBeDisabled();
  });
});
