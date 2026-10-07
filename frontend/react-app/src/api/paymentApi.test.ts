import { afterEach, describe, expect, it, vi } from "vitest";
import { completeCheckout, createPayment } from "./paymentApi";
import { getCsrfToken } from "./authApi";

vi.mock("./authApi", () => ({
  getCsrfToken: vi.fn(),
}));

describe("paymentApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create payment", async () => {
    vi.mocked(getCsrfToken).mockResolvedValue({
      headerName: "X-XSRF-TOKEN",
      token: "csrf-test-token",
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientSecret: "client_secret_test" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = {
      items: [{ productId: "product-123", quantity: 2 }],
    };

    const result = await createPayment("business-123", request);

    expect(result).toEqual({
      clientSecret: "client_secret_test",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/businesses/business-123/payments"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(request),
      }),
    );
  });

  it("should throw when payment creation fails", async () => {
    vi.mocked(getCsrfToken).mockResolvedValue({
      headerName: "X-XSRF-TOKEN",
      token: "csrf-test-token",
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    const request = {
      items: [{ productId: "product-123", quantity: 1 }],
    };

    await expect(createPayment("business-123", request)).rejects.toThrow(
      "Failed to create payment (500)",
    );
  });

  it("should complete checkout", async () => {
    vi.mocked(getCsrfToken).mockResolvedValue({
      headerName: "X-XSRF-TOKEN",
      token: "csrf-test-token",
    });

    const order = {
      id: "order-123",
      businessId: "business-123",
      status: "CREATED",
      totalPrice: 39.99,
      createdAt: "2026-10-07T10:00:00Z",
      items: [],
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(order), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = {
      paymentIntentId: "pi_test_success",
      items: [{ productId: "product-123", quantity: 1 }],
    };

    const result = await completeCheckout("business-123", request);

    expect(result).toEqual(order);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/businesses/business-123/payments/complete"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(request),
      }),
    );
  });

  it("should throw when checkout completion fails", async () => {
    vi.mocked(getCsrfToken).mockResolvedValue({
      headerName: "X-XSRF-TOKEN",
      token: "csrf-test-token",
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    const request = {
      paymentIntentId: "pi_test_failed",
      items: [{ productId: "product-123", quantity: 1 }],
    };

    await expect(completeCheckout("business-123", request)).rejects.toThrow(
      "Failed to complete checkout (400)",
    );
  });
});
