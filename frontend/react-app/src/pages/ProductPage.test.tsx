import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductPage from "./ProductPage";
import { getProducts } from "../api/productsApi";
import type { Product } from "../models/Product";

vi.mock("../api/productsApi", () => ({
    getProducts: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProducts);

const products: Product[] = [
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
    {
        id: "product-2",
        businessId: "business-1",
        name: "Old Keyboard",
        description: "Inactive keyboard",
        sku: "KEYBOARD-001",
        sellingPrice: 49.99,
        category: "Electronics",
        active: false,
    },
];

describe("ProductPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("displays active products", async () => {
        mockedGetProducts.mockResolvedValue(products);

        render(<ProductPage />);

        expect(screen.getByText("Loading products...")).toBeInTheDocument();

        expect(
            await screen.findByRole("heading", { name: "Gaming Mouse" }),
        ).toBeInTheDocument();

        expect(screen.queryByText("Old Keyboard")).not.toBeInTheDocument();
    });

    it("displays an empty state when no active products are available", async () => {
        mockedGetProducts.mockResolvedValue([
            {
                ...products[1],
            },
        ]);

        render(<ProductPage />);

        expect(
            await screen.findByText("No products are currently available."),
        ).toBeInTheDocument();
    });

    it("displays an error when loading products fails", async () => {
        mockedGetProducts.mockRejectedValue(new Error("Backend unavailable"));

        render(<ProductPage />);

        expect(
            await screen.findByText("Could not load products."),
        ).toBeInTheDocument();
    });
});