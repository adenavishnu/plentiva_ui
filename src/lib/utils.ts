import { PaymentStatus } from "@/types";

/** Format price to locale string */
export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Readable date-time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Status badge colour */
export function statusColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [PaymentStatus.PROCESSING]: "bg-blue-100 text-blue-800",
    [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800",
    [PaymentStatus.FAILED]: "bg-red-100 text-red-800",
    [PaymentStatus.CANCELLED]: "bg-gray-100 text-gray-800",
    [PaymentStatus.REFUNDED]: "bg-purple-100 text-purple-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

/** Generate a pseudo-UUID (for demo order IDs) */
export function generateOrderId(): string {
  return crypto.randomUUID();
}
