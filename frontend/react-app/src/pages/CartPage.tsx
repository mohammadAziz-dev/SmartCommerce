import { CartItemRow } from "../components/CartItemRow";
import { useCart } from "../hooks/useCart";
import "./CartPage.css";

export function CartPage() {
  const { items, totalQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main>
        <h1>Shopping Cart</h1>
        <p>Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-items">
        {items.map((item) => (
          <CartItemRow key={item.product.id} item={item} />
        ))}
      </div>

      <section className="cart-summary">
        <p>Total items: {totalQuantity}</p>
        <p className="cart-total">Total: €{totalPrice.toFixed(2)}</p>
      </section>
    </main>
  );
}
