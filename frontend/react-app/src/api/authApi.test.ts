import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login, logout, register } from "./authApi";

describe("authApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers with a CSRF token", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "csrf-token",
            headerName: "X-CSRF-TOKEN",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 201 }));

    await register({
      name: "Mohammad Aziz",
      email: "aziz@example.com",
      password: "Secret123!",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/auth/register"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "X-CSRF-TOKEN": "csrf-token",
        }),
      }),
    );
  });

  it("returns the current user when authenticated", async () => {
    const user = {
      id: "user-1",
      name: "Mohammad Aziz",
      email: "aziz@example.com",
      emailVerified: true,
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(user), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it("returns null when not authenticated", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("logs in with a CSRF token", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "csrf-token",
            headerName: "X-CSRF-TOKEN",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await login({
      email: "aziz@example.com",
      password: "Secret123!",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "X-CSRF-TOKEN": "csrf-token",
        }),
      }),
    );
  });

  it("logs out with a CSRF token", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: "csrf-token",
            headerName: "X-CSRF-TOKEN",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await logout();

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/auth/logout"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "X-CSRF-TOKEN": "csrf-token",
        }),
      }),
    );
  });
});
