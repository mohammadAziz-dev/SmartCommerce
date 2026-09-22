import type { Product } from "../models/Product";
import "./ProductCard.css";
import { useCart } from "../hooks/useCart";

interface ProductCardProps {
  readonly product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      <button type="button" onClick={() => addItem(product)}>
        Add to cart
      </button>

      <span className="product-card__category">{product.category}</span>

      <h2 className="product-card__title">{product.name}</h2>

      {product.description && (
        <p className="product-card__description">{product.description}</p>
      )}

      <p className="product-card__price">€{product.sellingPrice.toFixed(2)}</p>
    </article>
  );
}
