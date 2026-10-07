import { getCsrfToken } from "./authApi";
import type { OrderResponse } from "../models/Order";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreatePaymentItemRequest {
  productId: string;
  quantity: number;
}

export interface CreatePaymentRequest {
  items: CreatePaymentItemRequest[];
}

export interface CreatePaymentResponse {
  clientSecret: string;
}

export async function createPayment(
  businessId: string,
  request: CreatePaymentRequest,
): Promise<CreatePaymentResponse> {
  const csrf = await getCsrfToken();

  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/payments`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        [csrf.headerName]: csrf.token,
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create payment (${response.status})`);
  }

  return response.json() as Promise<CreatePaymentResponse>;
}

export interface CompleteCheckoutRequest {
  paymentIntentId: string;
  items: CreatePaymentItemRequest[];
}

export async function completeCheckout(
  businessId: string,
  request: CompleteCheckoutRequest,
): Promise<OrderResponse> {
  const csrf = await getCsrfToken();

  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/payments/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        [csrf.headerName]: csrf.token,
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to complete checkout (${response.status})`);
  }

  return response.json() as Promise<OrderResponse>;
}
