import { afterEach, describe, expect, it, vi } from "vitest";
import { getProducts } from "./productsApi";

describe("productsApi", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns products when the request succeeds", async () => {
        const products = [
            {
                id: "product-1",
                businessId: "business-1",
                name: "Gaming Mouse",
                description: "Wireless gaming mouse",
                sku: "MOUSE-001",
                sellingPrice: 29.99,
                category: "Electronics",
                active: true,
            },
        ];

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify(products), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        );

        const result = await getProducts("business-1");

        expect(result).toEqual(products);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/businesses/business-1/products"),
        );
    });

    it("throws an error when the request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, { status: 500 }),
        );

        await expect(getProducts("business-1")).rejects.toThrow(
            "Failed to load products (500)",
        );
    });
});