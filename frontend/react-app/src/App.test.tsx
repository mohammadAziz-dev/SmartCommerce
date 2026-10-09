import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

vi.mock("./components/AppLayout", () => ({
  default: () => (
    <>
      <span>App layout</span>
      <MockOutlet />
    </>
  ),
}));

vi.mock("./pages/HomePage", () => ({
  default: () => <h1>Marketplace page</h1>,
}));

vi.mock("./pages/ProductPage", () => ({
  default: () => <h1>Product catalogue</h1>,
}));

vi.mock("./pages/CartPage", () => ({
  CartPage: () => <h1>Shopping cart</h1>,
}));

vi.mock("./pages/CheckoutPage", () => ({
  CheckoutPage: () => <h1>Checkout page</h1>,
}));

vi.mock("./pages/RegisterPage", () => ({
  RegisterPage: () => <h1>Register page</h1>,
}));

vi.mock("./pages/VerifyEmailPage", () => ({
  VerifyEmailPage: () => <h1>Verify email page</h1>,
}));

vi.mock("./pages/LoginPage", () => ({
  LoginPage: () => <h1>Login page</h1>,
}));

import { Outlet as MockOutlet } from "react-router-dom";

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App routing", () => {
  it.each([
    ["/", "Marketplace page"],
    ["/products", "Product catalogue"],
    ["/cart", "Shopping cart"],
    ["/checkout", "Checkout page"],
    ["/register", "Register page"],
    ["/verify-email", "Verify email page"],
    ["/login", "Login page"],
    ["/shop/smartcommerce-demo/products", "Product catalogue"],
    ["/shop/gaming-store/products", "Product catalogue"],
    ["/shop/home-living-store/products", "Product catalogue"],
    ["/shop/gaming-store/cart", "Shopping cart"],
    ["/shop/home-living-store/cart", "Shopping cart"],
    ["/shop/gaming-store/checkout", "Checkout page"],
    ["/shop/home-living-store/checkout", "Checkout page"],
  ])("renders %s correctly", (path, expectedHeading) => {
    renderApp(path);

    expect(
      screen.getByRole("heading", { name: expectedHeading }),
    ).toBeInTheDocument();

    expect(screen.getByText("App layout")).toBeInTheDocument();
  });
});
