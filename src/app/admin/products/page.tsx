"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { getAllProducts, deleteProduct } from "@/lib/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const allProducts = getAllProducts();
      setProducts(allProducts);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      alert("Cannot delete default products");
      return;
    }

    if (confirm("Are you sure you want to delete this product?")) {
      setDeletingId(id);
      const success = deleteProduct(id);
      if (success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="mt-1 text-gray-600">Create, edit, and manage your product catalogue</p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isDefault = product.id.startsWith("prod-0");
                  return (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-8 w-8 rounded bg-gray-100 object-cover"
                          />
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {product.price.toFixed(2)} {product.currency}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            product.inStock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        <div className="flex items-center justify-center gap-1">
                          <span>⭐</span>
                          {product.rating}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={isDefault || deletingId === product.id}
                            onClick={() => handleDelete(product.id, isDefault)}
                            className={`${
                              isDefault
                                ? "cursor-not-allowed opacity-50"
                                : "text-red-600 hover:text-red-700"
                            } font-medium transition-colors`}
                          >
                            {deletingId === product.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
