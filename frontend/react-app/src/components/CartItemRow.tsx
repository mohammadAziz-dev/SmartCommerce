import type { CartItem } from "../models/CartItem";
import { useCart } from "../hooks/useCart";
import "./CartItemRow.css";

interface CartItemRowProps {
  readonly item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <article className="cart-item">
      <div className="cart-item-info">
        <h2>{item.product.name}</h2>
        <p>€{item.product.sellingPrice.toFixed(2)}</p>
      </div>

      <div className="cart-item-actions">
        <button
          className="quantity-button"
          type="button"
          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
          aria-label={`Decrease ${item.product.name} quantity`}
        >
          -
        </button>

        <span className="cart-item-quantity">{item.quantity}</span>

        <button
          className="quantity-button"
          type="button"
          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
          aria-label={`Increase ${item.product.name} quantity`}
        >
          +
        </button>

        <button
          className="remove-button"
          type="button"
          onClick={() => removeItem(item.product.id)}
        >
          Remove
        </button>
      </div>
    </article>
  );
}
