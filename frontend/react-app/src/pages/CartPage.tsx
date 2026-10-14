import {Link, useParams} from "react-router-dom";
import {CartItemRow} from "../components/CartItemRow";
import {useCart} from "../hooks/useCart";
import "./CartPage.css";

const businessNames: Record<string, string> = {
    "smartcommerce-demo": "SmartOffice Store",
    "gaming-store": "Gaming Store",
    "home-living-store": "Home Living Store",
};

export function CartPage() {
    const {items, totalQuantity, totalPrice} = useCart();

    const {businessSlug} = useParams<{ businessSlug: string }>();
    const cartTitle = businessSlug
        ? `Your Cart — ${businessNames[businessSlug] ?? "Store"}`
        : "Shopping Cart";

    const checkoutPath = businessSlug
        ? `/shop/${businessSlug}/checkout`
        : "/checkout";

    if (items.length === 0) {
        return (
            <main>
                <h1>{cartTitle}</h1>
                <p>Your cart is empty.</p>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <h1>{cartTitle}</h1>
            <div className="cart-items">
                {items.map((item) => (
                    <CartItemRow key={item.product.id} item={item}/>
                ))}
            </div>

            <section className="cart-summary">
                <p>Total items: {totalQuantity}</p>
                <p className="cart-total">Total: €{totalPrice.toFixed(2)}</p>
                <Link to={checkoutPath} className="cart-checkout-button">
                    Proceed to checkout
                </Link>
            </section>
        </main>
    );
}
