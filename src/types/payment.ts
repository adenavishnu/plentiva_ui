// ── Enums matching Java backend ──────────────────────────────────────────────

export enum PaymentProvider {
  PAYPAL = "PAYPAL",
  RAZORPAY = "RAZORPAY",
  PHONEPE = "PHONEPE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface RefundRequest {
  reason: string;
}

// ── Response DTOs ────────────────────────────────────────────────────────────

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  gatewayPaymentId?: string;
  gatewayRedirectUrl?: string;
  description?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Error ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}
