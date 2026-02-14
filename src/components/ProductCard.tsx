"use client";

import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* Product Image - Clickable */}
      <Link href={`/products/${product.id}`} className="relative h-52 w-full overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:bg-clip-text hover:text-transparent transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
