import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import ProductCard from "./ProductCard";
import type {Product} from "../models/Product";
import {CartProvider} from "../context/CartContext";

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

describe("ProductCard", () => {
    it("displays the product information", () => {
        render(
            <CartProvider>
                <ProductCard product={product}/>
            </CartProvider>,
        );

        expect(
            screen.getByRole("heading", {name: "Gaming Mouse"}),
        ).toBeInTheDocument();

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Wireless gaming mouse")).toBeInTheDocument();
        expect(screen.getByText("€29.99")).toBeInTheDocument();
    });

    it("displays a product image when an image URL exists", () => {
        render(
            <CartProvider>
                <ProductCard
                    product={{...product, imageUrl: "https://example.com/mouse.jpg"}}
                />
            </CartProvider>,
        );

        expect(screen.getByRole("img", {name: "Gaming Mouse"})).toHaveAttribute(
            "src",
            "https://example.com/mouse.jpg",
        );
    });

    it("displays fallback when image URL is missing", () => {
        render(
            <CartProvider>
                <ProductCard product={product}/>
            </CartProvider>,
        );

        expect(screen.getByText("No image available")).toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("hides a broken product image", () => {
        render(
            <CartProvider>
                <ProductCard
                    product={{...product, imageUrl: "https://example.com/broken.jpg"}}
                />
            </CartProvider>,
        );

        const image = screen.getByAltText("Gaming Mouse");

        fireEvent.error(image);

        expect(image).toHaveAttribute("hidden");
        expect(screen.getByText("No image available")).toBeInTheDocument();
    });
});
