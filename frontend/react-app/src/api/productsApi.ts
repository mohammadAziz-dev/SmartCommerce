import type { Product } from "../models/Product";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getProducts(businessId: string): Promise<Product[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/businesses/${businessId}/products`,
    );

    if (!response.ok) {
        throw new Error(`Failed to load products (${response.status})`);
    }

    return response.json() as Promise<Product[]>;
}