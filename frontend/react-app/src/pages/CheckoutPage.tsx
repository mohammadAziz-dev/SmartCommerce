import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useState } from "react";
import { placeOrder } from "../api/ordersApi";
import type { OrderResponse } from "../models/Order";

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await placeOrder(
        import.meta.env.VITE_BUSINESS_ID,
        request,
      );

      setOrder(createdOrder);
      clearCart();
    } catch {
      setError("Could not place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (order) {
    return (
      <section>
        <h1>Order confirmed</h1>
        <p>Your order has been placed successfully.</p>

        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>

        <h2>Order summary</h2>
        <ul>
          {order.items.map((item) => (
            <li key={item.productId}>
              {item.productName} × {item.quantity} — €{item.subtotal.toFixed(2)}
            </li>
          ))}
        </ul>

        <p>
          <strong>Total: €{order.totalPrice.toFixed(2)}</strong>
        </p>
        <Link to="/products">Continue shopping</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/products">Continue shopping</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Checkout</h1>

      <h2>Order summary</h2>
      <ul>
        {items.map((item) => (
          <li key={item.product.id}>
            {item.product.name} × {item.quantity} — €
            {(item.product.sellingPrice * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <p>
        <strong>Estimated total: €{totalPrice.toFixed(2)}</strong>
      </p>

      {error && <p role="alert">{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Placing order..." : "Place order"}
      </button>
    </section>
  );
}
