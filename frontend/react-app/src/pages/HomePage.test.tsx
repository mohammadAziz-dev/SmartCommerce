import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./HomePage";

describe("HomePage", () => {
    it("displays the SmartCommerce welcome heading", () => {
        render(<HomePage />);

        expect(
            screen.getByRole("heading", { name: "Welcome to SmartCommerce!" }),
        ).toBeInTheDocument();
    });
});