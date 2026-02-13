import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  ApiError,
} from "@/types";

// ── Base URL ─────────────────────────────────────────────────────────────────
// All requests go through Next.js rewrites → no CORS, no domain switching.
const PAYMENTS_ENDPOINT = "/api/v1/payments";
const BACKEND_API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:8080";
const UPLOADS_ENDPOINT = `${BACKEND_API_URL}/api/uploads/file`;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      status: res.status,
      message: res.statusText,
      timestamp: new Date().toISOString(),
    }));
    throw error;
  }
  return res.json();
}

function jsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── Payment API Client ──────────────────────────────────────────────────────

export const paymentApi = {
  /** POST /api/v1/payments — Initiate a payment */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const res = await fetch(PAYMENTS_ENDPOINT, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** GET /api/v1/payments/:paymentId */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}`, {
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** GET /api/v1/payments/order/:orderId */
  async getPaymentsByOrder(orderId: string): Promise<PaymentResponse[]> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/order/${orderId}`, {
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse[]>(res);
  },

  /** POST /api/v1/payments/:paymentId/verify */
  async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}/verify`, {
      method: "POST",
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** POST /api/v1/payments/:paymentId/refund */
  async refundPayment(
    paymentId: string,
    request: RefundRequest
  ): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}/refund`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** POST /api/v1/payments/:paymentId/cancel */
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}/cancel`, {
      method: "POST",
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse>(res);
  },
};

// ── File Upload API Client ──────────────────────────────────────────────────

export interface UploadResponse {
  success: boolean;
  file: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

export const uploadApi = {
  /** POST /api/uploads/file — Upload a file to backend */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch(UPLOADS_ENDPOINT, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        error: res.statusText,
      }));
      throw new Error(error.error || "Upload failed");
    }
    
    return res.json();
  },
};
