"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { paymentApi } from "@/lib/api";
import { PaymentResponse, PaymentStatus } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { formatPrice, formatDateTime } from "@/lib/utils";

function VerifyContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError("No payment ID provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const verify = async () => {
      const MAX_RETRIES = 6;
      const RETRY_DELAY = 2500; // ms

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (cancelled) return;

        try {
          // First attempt: call verify endpoint
          // Subsequent attempts: just fetch status (may already be verified)
          const result =
            attempt === 0
              ? await paymentApi.verifyPayment(paymentId).catch(() =>
                  paymentApi.getPayment(paymentId)
                )
              : await paymentApi.getPayment(paymentId);

          if (cancelled) return;

          const terminal = [
            PaymentStatus.COMPLETED,
            PaymentStatus.FAILED,
            PaymentStatus.CANCELLED,
            PaymentStatus.REFUNDED,
          ].includes(result.status);

          if (terminal) {
            setPayment(result);
            setLoading(false);
            return;
          }

          // Non-terminal (PENDING / PROCESSING) — update display and retry
          setPayment(result);

          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
          }
        } catch (err: unknown) {
          if (cancelled) return;
          if (attempt === MAX_RETRIES - 1) {
            const message =
              err && typeof err === "object" && "message" in err
                ? (err as { message: string }).message
                : "Failed to verify payment.";
            setError(message);
            setLoading(false);
            return;
          }
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
        }
      }

      // Exhausted retries — show whatever we have
      if (!cancelled) {
        setLoading(false);
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <svg
          className="h-10 w-10 animate-spin text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-25"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            className="opacity-75"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          Verifying your payment…
        </p>
        {payment && (
          <p className="text-xs text-gray-400">
            Current status: {payment.status} — checking with payment gateway…
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <span className="text-6xl">❌</span>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Verification Failed
        </h2>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isSuccess = payment?.status === PaymentStatus.COMPLETED;
  const isFailed = payment?.status === PaymentStatus.FAILED;
  const isCancelled = payment?.status === PaymentStatus.CANCELLED;
  const isPending =
    payment?.status === PaymentStatus.PENDING ||
    payment?.status === PaymentStatus.PROCESSING;

  const icon = isSuccess
    ? "✅"
    : isFailed
      ? "❌"
      : isCancelled
        ? "🚫"
        : "⏳";

  const heading = isSuccess
    ? "Payment Successful!"
    : isFailed
      ? "Payment Failed"
      : isCancelled
        ? "Payment Cancelled"
        : `Payment ${payment?.status}`;

  const subtext = isSuccess
    ? "Your order has been placed successfully."
    : isFailed
      ? payment?.failureReason ?? "Something went wrong with your payment."
      : isCancelled
        ? "Your payment was cancelled."
        : "Your payment is still being processed. Check back shortly.";

  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <span className="text-7xl">{icon}</span>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">{heading}</h2>
      <p className="mt-2 text-sm text-gray-500">{subtext}</p>

      {payment && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Payment ID</dt>
              <dd className="font-mono text-xs text-gray-900">
                {payment.id}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Order ID</dt>
              <dd className="font-mono text-xs text-gray-900">
                {payment.orderId}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Provider</dt>
              <dd className="text-gray-900">{payment.provider}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Amount</dt>
              <dd className="font-semibold text-gray-900">
                {formatPrice(payment.amount, payment.currency)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <StatusBadge status={payment.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-900">
                {formatDateTime(payment.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      )}		

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {isSuccess && (
          <Link
            href="/orders"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View Orders
          </Link>
        )}
        {(isFailed || isCancelled) && (
          <Link
            href="/checkout"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try Again
          </Link>
        )}
        {isPending && (
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Refresh Status
          </button>
        )}
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
