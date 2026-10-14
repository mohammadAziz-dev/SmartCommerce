import {fireEvent, render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {describe, expect, it} from "vitest";
import {CartProvider} from "../context/CartContext";
import {CartPage} from "./CartPage";
import {useCart} from "../hooks/useCart";
import type {Product} from "../models/Product";

const product: Product = {
    id: "product-1",
    businessId: "business-1",
    name: "Gaming Mouse",
    description: "Wireless gaming mouse",
    imageUrl: null,
    sku: "MOUSE-001",
    sellingPrice: 39.99,
    category: "Gaming",
    active: true,
};

function AddProductButton() {
    const {addItem} = useCart();

    return (
        <button type="button" onClick={() => addItem(product)}>
            Add product
        </button>
    );
}

describe("CartPage", () => {
    it("shows an empty cart message when the cart has no items", () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <CartPage/>
                </CartProvider>
            </MemoryRouter>,
        );

        expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {name: /Continue Shopping/i}),
        ).toHaveAttribute("href", "/");
    });

    it("shows cart items and totals", () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <AddProductButton/>
                    <CartPage/>
                </CartProvider>
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole("button", {name: "Add product"}));

        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
        expect(screen.getByText("Total items: 1")).toBeInTheDocument();
        expect(screen.getByText("Total: €39.99")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {name: /Continue Shopping/i}),
        ).toHaveAttribute("href", "/");
    });

    it.each([
        ["smartcommerce-demo", "SmartOffice Store"],
        ["gaming-store", "Gaming Store"],
        ["home-living-store", "Home Living Store"],
    ])("shows the correct cart heading for %s", (slug, name) => {
        render(
            <MemoryRouter initialEntries={[`/shop/${slug}/cart`]}>
                <CartProvider>
                    <Routes>
                        <Route
                            path="/shop/:businessSlug/cart"
                            element={<CartPage/>}
                        />
                    </Routes>
                </CartProvider>
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("heading", {
                name: `Your Cart — ${name}`,
            }),
        ).toBeInTheDocument();

        expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {name: /Continue Shopping/i}),
        ).toHaveAttribute("href", `/shop/${slug}/products`);
    });

    it("keeps the legacy cart heading", () => {
        render(
            <MemoryRouter initialEntries={["/cart"]}>
                <CartProvider>
                    <Routes>
                        <Route path="/cart" element={<CartPage/>}/>
                    </Routes>
                </CartProvider>
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("heading", {name: "Shopping Cart"}),
        ).toBeInTheDocument();
    });
});
