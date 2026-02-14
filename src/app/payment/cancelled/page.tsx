"use client";

import Link from "next/link";

export default function CancelledPage() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <span className="text-7xl">🚫</span>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        Payment Cancelled
      </h2>
      <p className="mt-2 text-gray-500">
        Your payment was cancelled. No charges were made.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/checkout"
          className="rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2.5 text-sm font-medium text-white hover:shadow-lg transition-all"
        >
          Try Again
        </Link>
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
