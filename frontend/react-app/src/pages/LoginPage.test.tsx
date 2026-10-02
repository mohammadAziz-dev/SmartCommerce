import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { AuthProvider } from "../context/AuthContext";
import * as authApi from "../api/authApi";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LoginPage", () => {
  it("logs in and redirects to products", async () => {
    vi.spyOn(authApi, "getCurrentUser")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user-1",
        name: "Mohammad Aziz",
        email: "aziz@example.com",
        emailVerified: true,
      });

    vi.spyOn(authApi, "login").mockResolvedValue();

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<p>Products page</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "aziz@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Products page")).toBeInTheDocument();

    expect(authApi.login).toHaveBeenCalledWith({
      email: "aziz@example.com",
      password: "password123",
    });
  });

  it("shows an error when login fails", async () => {
    vi.spyOn(authApi, "getCurrentUser").mockResolvedValue(null);
    vi.spyOn(authApi, "login").mockRejectedValue(new Error());

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "aziz@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not log in. Please check your email and password.",
    );
  });
});
