import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {MemoryRouter} from "react-router-dom";
import ProductCard from "./ProductCard";
import type {Product} from "../models/Product";
import {CartProvider} from "../context/CartContext";
import {useCart} from "../hooks/useCart";

const product: Product = {
    id: "product-1",
    businessId: "business-1",
    name: "Gaming Mouse",
    description: "Wireless gaming mouse",
    imageUrl: null,
    sku: "MOUSE-001",
    sellingPrice: 29.99,
    category: "Electronics",
    active: true,
};

function CartQuantity() {
    const {totalQuantity} = useCart();

    return <span>Cart quantity: {totalQuantity}</span>;
}

function renderWithCart(ui: React.ReactNode) {
    return render(
        <MemoryRouter initialEntries={["/shop/gaming-store/products"]}>
            <CartProvider>{ui}</CartProvider>
        </MemoryRouter>,
    );
}

describe("ProductCard", () => {
    it("displays the product information", () => {
        renderWithCart(<ProductCard product={product}/>);

        expect(
            screen.getByRole("heading", {name: "Gaming Mouse"}),
        ).toBeInTheDocument();

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Wireless gaming mouse")).toBeInTheDocument();
        expect(screen.getByText("€29.99")).toBeInTheDocument();
    });

    it("displays a product image when an image URL exists", () => {
        renderWithCart(
            <ProductCard
                product={{
                    ...product,
                    imageUrl: "https://example.com/mouse.jpg",
                }}
            />,
        );

        expect(
            screen.getByRole("img", {name: "Gaming Mouse"}),
        ).toHaveAttribute("src", "https://example.com/mouse.jpg");
    });

    it("displays fallback when image URL is missing", () => {
        renderWithCart(<ProductCard product={product}/>);

        expect(screen.getByText("No image available")).toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("hides a broken product image", () => {
        renderWithCart(
            <ProductCard
                product={{
                    ...product,
                    imageUrl: "https://example.com/broken.jpg",
                }}
            />,
        );

        const image = screen.getByAltText("Gaming Mouse");

        fireEvent.error(image);

        expect(image).toHaveAttribute("hidden");
        expect(screen.getByText("No image available")).toBeInTheDocument();
    });

    it("adds a product to the cart when clicking Add to cart", () => {
        renderWithCart(
            <>
                <ProductCard product={product}/>
                <CartQuantity/>
            </>,
        );

        expect(screen.getByText("Cart quantity: 0")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {name: "Add to cart"}),
        );

        expect(screen.getByText("Cart quantity: 1")).toBeInTheDocument();
    });
});
