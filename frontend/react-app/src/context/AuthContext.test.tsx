import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";
import * as authApi from "../api/authApi";

const user: authApi.AuthenticatedUser = {
  id: "user-1",
  name: "Mohammad Aziz",
  email: "aziz@example.com",
  emailVerified: true,
};

function TestAuth() {
  const { user, loading, login, logout } = useAuth();

  return (
    <>
      <span>{loading ? "Loading" : "Loaded"}</span>
      <span>{user ? user.name : "Not logged in"}</span>

      <button
        type="button"
        onClick={() =>
          login({
            email: "aziz@example.com",
            password: "password123",
          })
        }
      >
        Log in
      </button>

      <button type="button" onClick={logout}>
        Log out
      </button>
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AuthContext", () => {
  it("loads the current authenticated user", async () => {
    vi.spyOn(authApi, "getCurrentUser").mockResolvedValue(user);

    render(
      <AuthProvider>
        <TestAuth />
      </AuthProvider>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();

    expect(await screen.findByText("Mohammad Aziz")).toBeInTheDocument();
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });

  it("shows no user when not authenticated", async () => {
    vi.spyOn(authApi, "getCurrentUser").mockResolvedValue(null);

    render(
      <AuthProvider>
        <TestAuth />
      </AuthProvider>,
    );

    expect(await screen.findByText("Not logged in")).toBeInTheDocument();
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });

  it("updates the user after login", async () => {
    vi.spyOn(authApi, "getCurrentUser")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);
    vi.spyOn(authApi, "login").mockResolvedValue();

    render(
      <AuthProvider>
        <TestAuth />
      </AuthProvider>,
    );

    expect(await screen.findByText("Not logged in")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Mohammad Aziz")).toBeInTheDocument();

    expect(authApi.login).toHaveBeenCalledWith({
      email: "aziz@example.com",
      password: "password123",
    });
  });

  it("clears the user after logout", async () => {
    vi.spyOn(authApi, "getCurrentUser").mockResolvedValue(user);
    vi.spyOn(authApi, "logout").mockResolvedValue();

    render(
      <AuthProvider>
        <TestAuth />
      </AuthProvider>,
    );

    expect(await screen.findByText("Mohammad Aziz")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument();
    });

    expect(authApi.logout).toHaveBeenCalledOnce();
  });
});
