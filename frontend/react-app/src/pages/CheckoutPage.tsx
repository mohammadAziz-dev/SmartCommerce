import {Link, useParams} from "react-router-dom";
import {useCart} from "../hooks/useCart";
import {useState} from "react";
import type {OrderResponse} from "../models/Order";
import {completeCheckout, createPayment} from "../api/paymentApi";
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import PaymentForm from "../components/PaymentForm";
import "./CheckoutPage.css";
import {getBusinessId} from "../config/businesses";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function CheckoutPage() {
    const {items, totalPrice, clearCart} = useCart();
    const {businessSlug} = useParams<{ businessSlug: string }>();
    const businessId = getBusinessId(businessSlug);
    const productsPath = businessSlug
        ? `/shop/${businessSlug}/products`
        : "/products";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    async function handleSubmit() {
        if (isSubmitting) {
            return;
        }

        if (!businessId) {
            setError("Business not found.");
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

            const payment = await createPayment(
                businessId,
                request,
            );

            setClientSecret(payment.clientSecret);
        } catch {
            setError("Could not start payment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!businessId) {
        return (
            <section className="checkout-page">
                <h1>Business not found.</h1>
                <Link to="/">Back to home</Link>
            </section>
        );
    }

    if (order) {
        return (
            <section className="checkout-page">
                <div className="checkout-summary">
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
                                {item.productName} × {item.quantity} — €
                                {item.subtotal.toFixed(2)}
                            </li>
                        ))}
                    </ul>

                    <p className="checkout-total">
                        <strong>Total: €{order.totalPrice.toFixed(2)}</strong>
                    </p>

                    <Link to={productsPath}>Continue shopping</Link>
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="checkout-page">
                <div className="checkout-summary">
                    <h1>Checkout</h1>
                    <p>Your cart is empty.</p>
                    <Link to={productsPath}>Continue shopping</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout-page">
            <h1>Checkout</h1>

            <div className="checkout-summary">
                <h2>Order summary</h2>

                <ul>
                    {items.map((item) => (
                        <li key={item.product.id}>
                            {item.product.name} × {item.quantity} — €
                            {(item.product.sellingPrice * item.quantity).toFixed(2)}
                        </li>
                    ))}
                </ul>

                <p className="checkout-total">
                    <strong>Estimated total: €{totalPrice.toFixed(2)}</strong>
                </p>
            </div>

            {error && <p role="alert">{error}</p>}

            {clientSecret ? (
                <Elements stripe={stripePromise} options={{clientSecret}}>
                    <PaymentForm
                        onPaymentSuccess={async (paymentIntentId) => {
                            const request = {
                                paymentIntentId,
                                items: items.map((item) => ({
                                    productId: item.product.id,
                                    quantity: item.quantity,
                                })),
                            };

                            if (!businessId) {
                                throw new Error("Business not found.");
                            }

                            const createdOrder = await completeCheckout(
                                businessId,
                                request,
                            );

                            setOrder(createdOrder);
                            clearCart();
                        }}
                    />
                </Elements>
            ) : (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Preparing payment..." : "Continue to payment"}
                </button>
            )}
        </section>
    );
}
