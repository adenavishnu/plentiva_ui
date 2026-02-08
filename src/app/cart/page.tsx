"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/CartItemRow";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500">Browse products and add something!</p>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Order Summary
          </h3>

          <div className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <hr />
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-lg bg-indigo-600 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
