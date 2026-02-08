"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { paymentApi } from "@/lib/api";
import { PaymentResponse } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { formatPrice, formatDateTime } from "@/lib/utils";

function OrdersContent() {
  const { orders } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Record<string, PaymentResponse[]>>(
    {}
  );
  const [loadingOrder, setLoadingOrder] = useState<string | null>(null);

  const fetchPayments = async (orderId: string) => {
    if (payments[orderId]) return; // already fetched
    setLoadingOrder(orderId);
    try {
      const result = await paymentApi.getPaymentsByOrder(orderId);
      setPayments((prev) => ({ ...prev, [orderId]: result }));
    } catch {
      // silently handle — no payments found
      setPayments((prev) => ({ ...prev, [orderId]: [] }));
    } finally {
      setLoadingOrder(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-6xl">📦</span>
        <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500">
          Once you place an order, it will appear here.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-mono text-sm text-gray-900">
                  {order.id.slice(0, 8)}…
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-900">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatPrice(order.totalAmount, order.currency)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50 px-6">
              {order.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(
                      item.product.price * item.quantity,
                      item.product.currency
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment details */}
            <div className="border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => fetchPayments(order.id)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {payments[order.id]
                  ? "Payment Details ↓"
                  : loadingOrder === order.id
                  ? "Loading…"
                  : "View Payment Details →"}
              </button>

              {payments[order.id] && payments[order.id].length > 0 && (
                <div className="mt-3 space-y-2">
                  {payments[order.id].map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-3 text-xs"
                    >
                      <span className="font-mono text-gray-600">
                        {p.id.slice(0, 8)}…
                      </span>
                      <span className="text-gray-700">{p.provider}</span>
                      <span className="font-semibold">
                        {formatPrice(p.amount, p.currency)}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              )}

              {payments[order.id] && payments[order.id].length === 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  No payment records found for this order.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <p className="text-gray-500">Loading orders…</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
