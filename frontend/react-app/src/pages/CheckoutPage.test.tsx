import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "../models/Product";
import { useCart } from "../hooks/useCart";
import { CheckoutPage } from "./CheckoutPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
  imageUrl: null,
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

function renderCheckout(path = "/shop/gaming-store/checkout") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CartProvider>
        <Routes>
          <Route
            path="/shop/:businessSlug/checkout"
            element={<CheckoutTestSetup />}
          />
          <Route path="/checkout" element={<CheckoutTestSetup />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe("CheckoutPage", () => {
  it("shows cart items and estimated total", () => {
    renderCheckout();

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

    renderCheckout();

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    expect(mockedCreatePayment).toHaveBeenCalledWith(
      "8cc9cfa3-8159-462b-bd21-8619d5d82755",
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

    renderCheckout();

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

    renderCheckout();

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
      "8cc9cfa3-8159-462b-bd21-8619d5d82755",
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

    renderCheckout();

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    const submittingButton = await screen.findByRole("button", {
      name: "Preparing payment...",
    });

    expect(submittingButton).toBeDisabled();
  });

  it("starts payment for Home Living Store", async () => {
    vi.mocked(createPayment).mockResolvedValue({
      clientSecret: "test-client-secret",
    });

    renderCheckout("/shop/home-living-store/checkout");

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );

    await waitFor(() => {
      expect(createPayment).toHaveBeenCalledWith(
        "47aa6ef6-16dc-4999-8047-0812012c998b",
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
  });

  it("shows an empty cart with a business-specific shopping link", () => {
    renderCheckout();

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Continue shopping" }),
    ).toHaveAttribute("href", "/shop/gaming-store/products");

    expect(createPayment).not.toHaveBeenCalled();
  });

  it("shows business not found for an unknown store", () => {
    renderCheckout("/shop/unknown-store/checkout");

    expect(
      screen.getByRole("heading", { name: "Business not found." }),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );

    expect(createPayment).not.toHaveBeenCalled();
  });

  it("uses the legacy products link on the legacy checkout route", () => {
    renderCheckout("/checkout");

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Continue shopping" }),
    ).toHaveAttribute("href", "/products");
  });
});
