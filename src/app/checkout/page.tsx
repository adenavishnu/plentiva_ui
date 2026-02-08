"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import PaymentProviderSelector from "@/components/PaymentProviderSelector";
import { PaymentProvider } from "@/types";
import { paymentApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const providerLabels: Record<PaymentProvider, string> = {
  [PaymentProvider.PAYPAL]: "PayPal",
  [PaymentProvider.RAZORPAY]: "Razorpay",
  [PaymentProvider.PHONEPE]: "PhonePe",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, placeOrder } = useCart();
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-6xl">🧾</span>
        <h2 className="text-2xl font-bold text-gray-900">Nothing to checkout</h2>
        <p className="text-gray-500">Add items to your cart first.</p>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handlePay = async () => {
    if (!selectedProvider) {
      setError("Please select a payment method.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Create local order
      const order = placeOrder();

      // 2. Initiate payment via backend
      const payment = await paymentApi.initiatePayment({
        orderId: order.id,
        amount: totalAmount,
        currency: "INR",
        provider: selectedProvider,
        description: `Order ${order.id.slice(0, 8)}`,
        returnUrl: `${window.location.origin}/payment/verify`,
        cancelUrl: `${window.location.origin}/payment/cancelled`,
      });

      // 3. Handle redirect-based providers (PayPal / PhonePe)
      if (payment.gatewayRedirectUrl) {
        setRedirecting(true);
        // Small delay so the overlay is visible before navigation
        await new Promise((r) => setTimeout(r, 100));
        window.location.href = payment.gatewayRedirectUrl;
        return; // Don't reset loading — we're navigating away
      }

      // 4. For Razorpay — open Razorpay Checkout.js (inline)
      if (selectedProvider === PaymentProvider.RAZORPAY && payment.gatewayPaymentId) {
        openRazorpayCheckout(payment.id, payment.gatewayPaymentId, totalAmount);
        return;
      }

      // 5. Fallback — go to verify page
      router.push(`/payment/verify?paymentId=${payment.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Payment initiation failed. Please try again.";
      setError(message);
      setLoading(false);
      setRedirecting(false);
    }
  };

  /**
   * Opens the Razorpay inline checkout widget.
   * The Razorpay script is loaded dynamically.
   */
  const openRazorpayCheckout = (
    paymentId: string,
    razorpayOrderId: string,
    amount: number
  ) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: amount * 100, // paise
        currency: "INR",
        name: "PayStore",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: () => {
          // On success — verify with backend
          router.push(`/payment/verify?paymentId=${paymentId}`);
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled by user.");
            setLoading(false);
          },
        },
        theme: { color: "#4f46e5" },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setLoading(false);
    };
    script.onerror = () => {
      setError("Failed to load payment gateway. Please try again.");
      setLoading(false);
    };
    document.body.appendChild(script);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Full-screen redirect overlay */}
      {redirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-10 shadow-xl">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg
                className="h-16 w-16 animate-spin text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-20"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  className="opacity-75"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Redirecting to {selectedProvider ? providerLabels[selectedProvider] : "payment gateway"}…
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Please wait while we securely transfer you.
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Do not close or refresh this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-8 text-2xl font-bold text-gray-900">Checkout</h1>

      {/* Order Summary */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Order Items
        </h3>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(
                  item.product.price * item.quantity,
                  item.product.currency
                )}
              </span>
            </div>
          ))}
        </div>
        <hr className="my-3" />
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Payment Provider Selection */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <PaymentProviderSelector
          selected={selectedProvider}
          onSelect={setSelectedProvider}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={loading || !selectedProvider}
        className="w-full rounded-lg bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
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
            Processing…
          </span>
        ) : (
          `Pay ${formatPrice(totalAmount)}`
        )}
      </button>
    </div>
  );
}
