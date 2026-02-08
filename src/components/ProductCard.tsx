"use client";

import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* Image placeholder */}
      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <span className="text-5xl">
          {product.category === "Electronics" ? "🔌" : "🪑"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            ★ {product.rating}
          </span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>

          <button
            disabled={!product.inStock}
            onClick={() => addItem(product)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
