import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {describe, expect, it} from "vitest";
import HomePage from "./HomePage";

describe("HomePage", () => {
    it("displays the SmartCommerce welcome heading", () => {
        render(
            <MemoryRouter>
                <HomePage/>
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("heading", {name: "Explore our stores"}),
        ).toBeInTheDocument();
    });


    it("displays links to all three business storefronts", () => {
        render(
            <MemoryRouter>
                <HomePage/>
            </MemoryRouter>,
        );

        expect(
            screen.getByRole("link", {name: /SmartOffice Store/i}),
        ).toHaveAttribute("href", "/shop/smartcommerce-demo/products");

        expect(
            screen.getByRole("link", {name: /Gaming Store/i}),
        ).toHaveAttribute("href", "/shop/gaming-store/products");

        expect(
            screen.getByRole("link", {name: /Home Living Store/i}),
        ).toHaveAttribute("href", "/shop/home-living-store/products");
    });

});