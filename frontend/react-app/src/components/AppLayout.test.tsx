import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const login = vi.fn();
const logout = vi.fn();

function renderLayout(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<p>Home content</p>} />
          <Route
            path="/shop/:businessSlug/products"
            element={<p>Store products</p>}
          />
          <Route path="/shop/:businessSlug/cart" element={<p>Store cart</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login,
      logout,
    });
  });

  it("shows marketplace navigation for guests", () => {
    renderLayout();

    expect(screen.getByRole("link", { name: "SmartCommerce" })).toHaveAttribute(
      "href",
      "/",
    );

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "href",
      "/products",
    );

    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute(
      "href",
      "/cart",
    );

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register",
    );

    expect(screen.getByText("Home content")).toBeInTheDocument();
    expect(screen.getByText("© SmartCommerce")).toBeInTheDocument();
  });

  it("keeps navigation inside Gaming Store", () => {
    renderLayout("/shop/gaming-store/products");

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "href",
      "/shop/gaming-store/products",
    );

    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute(
      "href",
      "/shop/gaming-store/cart",
    );
  });

  it("keeps navigation inside Home Living Store", () => {
    renderLayout("/shop/home-living-store/products");

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "href",
      "/shop/home-living-store/products",
    );

    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute(
      "href",
      "/shop/home-living-store/cart",
    );
  });

  it("shows logged-in user and calls logout", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "test-user-123",
        name: "Test Customer",
        email: "test@example.com",
        emailVerified: true,
      },
      loading: false,
      login,
      logout,
    } as ReturnType<typeof useAuth>);

    renderLayout();

    expect(screen.getByText("Test Customer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(logout).toHaveBeenCalledOnce();

    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
  });

  it("hides authentication actions while loading", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "test-user-123",
        name: "Test Customer",
        email: "test@example.com",
        emailVerified: true,
      },
      loading: true,
      login,
      logout,
    });

    renderLayout();

    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Log out" }),
    ).not.toBeInTheDocument();
  });
});
