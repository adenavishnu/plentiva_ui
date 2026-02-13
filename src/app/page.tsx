"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products";
import { Product } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = getAllProducts();
      setProducts(allProducts);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

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
      {isLoading ? (
        <div className="text-center text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500">No products available</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
