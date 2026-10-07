import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";

type PaymentFormProps = {
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
};

export default function PaymentForm({ onPaymentSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements || isPaying) {
      return;
    }

    setIsPaying(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed. Please try again.");
      setIsPaying(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      try {
        await onPaymentSuccess(result.paymentIntent.id);
      } catch {
        setError("Payment succeeded, but the order could not be created.");
      } finally {
        setIsPaying(false);
      }

      return;
    }

    setError("Payment was not completed.");
    setIsPaying(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Payment</h2>

      <PaymentElement />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={!stripe || isPaying}>
        {isPaying ? "Processing payment..." : "Pay now"}
      </button>
    </form>
  );
}
