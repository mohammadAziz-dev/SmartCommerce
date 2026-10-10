import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import type {Product} from "../models/Product";
import ProductCard from "../components/ProductCard";
import {getProducts} from "../api/productsApi";
import {getBusinessId} from "../config/businesses";
import "./ProductPage.css";

export default function ProductPage() {
    const {businessSlug} = useParams<{ businessSlug: string }>();
    const businessId = getBusinessId(businessSlug);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!businessId) {
            return;
        }

        let cancelled = false;

        async function loadProducts() {
            try {
                setLoading(true);
                setError(null);

                const result = await getProducts(businessId!);
                console.log("Business ID:", businessId);
                console.log("Products received:", result);

                if (!cancelled) {
                    setProducts(result);
                }
            } catch {
                if (!cancelled) {
                    setError("Could not load products.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProducts();

        return () => {
            cancelled = true;
        };
    }, [businessId]);

    if (!businessId) {
        return <p>Business not found.</p>;
    }

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const activeProducts = products.filter((product) => product.active);

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
                    <ProductCard key={product.id} product={product}/>
                ))}
            </div>
        </main>
    );
}
