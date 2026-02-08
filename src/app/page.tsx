"use client";

import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to <span className="text-indigo-600">PayStore</span>
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Browse products and pay seamlessly via PayPal, Razorpay, or PhonePe
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
