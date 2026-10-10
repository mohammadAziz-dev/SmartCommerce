import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import ProductPage from "./ProductPage";
import {getProducts} from "../api/productsApi";
import type {Product} from "../models/Product";
import {CartProvider} from "../context/CartContext";

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
        imageUrl: null,
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
        imageUrl: null,
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

    function renderProductPage(
        path = "/shop/gaming-store/products",
    ) {
        return render(
            <MemoryRouter initialEntries={[path]}>
                <CartProvider>
                    <Routes>
                        <Route
                            path="/shop/:businessSlug/products"
                            element={<ProductPage/>}
                        />
                        <Route
                            path="/products"
                            element={<ProductPage/>}
                        />
                    </Routes>
                </CartProvider>
            </MemoryRouter>,
        );
    }

    it("displays active products", async () => {
        mockedGetProducts.mockResolvedValue(products);

        renderProductPage();

        expect(screen.getByText("Loading products...")).toBeInTheDocument();

        expect(
            await screen.findByRole("heading", {name: "Gaming Mouse"}),
        ).toBeInTheDocument();

        expect(screen.queryByText("Old Keyboard")).not.toBeInTheDocument();
    });

    it("displays an empty state when no active products are available", async () => {
        mockedGetProducts.mockResolvedValue([products[1]]);

        renderProductPage();

        expect(
            await screen.findByText("No products are currently available."),
        ).toBeInTheDocument();
    });

    it("displays an error when loading products fails", async () => {
        mockedGetProducts.mockRejectedValue(
            new Error("Backend unavailable"),
        );

        renderProductPage();

        expect(
            await screen.findByText("Could not load products."),
        ).toBeInTheDocument();
    });

    it("loads Gaming Store products using the correct business UUID", async () => {
        mockedGetProducts.mockResolvedValue(products);

        renderProductPage("/shop/gaming-store/products");

        expect(
            await screen.findByRole("heading", {name: "Gaming Mouse"}),
        ).toBeInTheDocument();

        expect(mockedGetProducts).toHaveBeenCalledWith(
            "8cc9cfa3-8159-462b-bd21-8619d5d82755",
        );
    });

    it("loads Home Living Store products using the correct business UUID", async () => {
        mockedGetProducts.mockResolvedValue(products);

        renderProductPage("/shop/home-living-store/products");

        expect(
            await screen.findByRole("heading", {name: "Gaming Mouse"}),
        ).toBeInTheDocument();

        expect(mockedGetProducts).toHaveBeenCalledWith(
            "47aa6ef6-16dc-4999-8047-0812012c998b",
        );
    });

    it("shows an error for an unknown business", () => {
        renderProductPage("/shop/unknown-store/products");

        expect(screen.getByText("Business not found.")).toBeInTheDocument();
        expect(mockedGetProducts).not.toHaveBeenCalled();
    });
});
