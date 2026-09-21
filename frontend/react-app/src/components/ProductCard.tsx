import type { Product } from "../models/Product";
import "./ProductCard.css";

interface ProductCardProps {
    readonly product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <article className="product-card">
            <span className="product-card__category">{product.category}</span>

            <h2 className="product-card__title">{product.name}</h2>

            {product.description && (
                <p className="product-card__description">{product.description}</p>
            )}

            <p className="product-card__price">
                €{product.sellingPrice.toFixed(2)}
            </p>
        </article>
    );
}