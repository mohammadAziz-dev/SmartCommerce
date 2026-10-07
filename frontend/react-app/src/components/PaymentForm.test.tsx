import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PaymentForm from "./PaymentForm";

const confirmPaymentMock = vi.fn();

vi.mock("@stripe/react-stripe-js", () => ({
  PaymentElement: () => <div>Payment Element</div>,
  useStripe: () => ({
    confirmPayment: confirmPaymentMock,
  }),
  useElements: () => ({}),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PaymentForm", () => {
  it("should show the payment form", () => {
    render(<PaymentForm onPaymentSuccess={vi.fn()} />);

    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Payment Element")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay now" })).toBeInTheDocument();
  });

  it("should show an error when payment fails", async () => {
    const onPaymentSuccess = vi.fn();

    confirmPaymentMock.mockResolvedValueOnce({
      error: {
        message: "Your card was declined.",
      },
    });

    render(<PaymentForm onPaymentSuccess={onPaymentSuccess} />);

    fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your card was declined.",
    );

    expect(onPaymentSuccess).not.toHaveBeenCalled();
  });

  it("should call onPaymentSuccess when payment succeeds", async () => {
    const onPaymentSuccess = vi.fn().mockResolvedValue(undefined);

    confirmPaymentMock.mockResolvedValueOnce({
      paymentIntent: {
        id: "pi_test_success",
        status: "succeeded",
      },
    });

    render(<PaymentForm onPaymentSuccess={onPaymentSuccess} />);

    fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

    await vi.waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledWith("pi_test_success");
    });
  });

  it("should show an error when payment succeeds but order creation fails", async () => {
    const onPaymentSuccess = vi
      .fn()
      .mockRejectedValue(new Error("Order creation failed"));

    confirmPaymentMock.mockResolvedValueOnce({
      paymentIntent: {
        id: "pi_test_success",
        status: "succeeded",
      },
    });

    render(<PaymentForm onPaymentSuccess={onPaymentSuccess} />);

    fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Payment succeeded, but the order could not be created.",
    );
  });
});
