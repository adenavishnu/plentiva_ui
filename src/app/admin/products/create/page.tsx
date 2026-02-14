"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { createProductViaAPI } from "@/lib/products";
import { Product } from "@/types";

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (productData: Omit<Product, "id">) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newProduct = await createProductViaAPI(productData);
      
      if (!newProduct) {
        throw new Error("Failed to create product");
      }
      
      setSuccess(true);
      console.log("Product created:", newProduct);
      
      // Redirect to admin products page after success
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-purple-600 hover:text-purple-700">
          ← Back to Products
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-1 text-gray-600">Fill in the details below to add a new product to your catalogue</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
          ✓ Product created successfully! Redirecting...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
          ✕ {error}
        </div>
      )}

      {/* Form Container */}
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
