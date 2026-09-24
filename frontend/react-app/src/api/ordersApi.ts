import type { CreateOrderRequest, OrderResponse } from "../models/Order";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function placeOrder(
  businessId: string,
  request: CreateOrderRequest,
): Promise<OrderResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to place order (${response.status})`);
  }

  return response.json() as Promise<OrderResponse>;
}
