import { useEffect, useState } from "react";
import type { Product } from "../models/Product";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/productsApi";
import "./ProductPage.css";

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID;

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeProducts = products.filter((product) => product.active);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const products = await getProducts(BUSINESS_ID);
        setProducts(products);
      } catch {
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (activeProducts.length === 0) {
    return (
      <main>
        <h1>Products</h1>
        <p>No products are currently available.</p>
      </main>
    );
  }

  return (
    <main className="product-page">
      <h1>Products</h1>

      <div className="product-grid">
        {activeProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
