"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProductByIdFromAPI, updateProductViaAPI } from "@/lib/products";
import { Product } from "@/types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      const foundProduct = await getProductByIdFromAPI(productId);
      if (!foundProduct) {
        alert("Product not found");
        router.push("/admin/products");
        return;
      }
      
      setProduct(foundProduct);
    };
    
    loadProduct();
  }, [productId, router]);

  const handleSubmit = async (updatedData: Omit<Product, "id">) => {
    setIsLoading(true);
    
    const success = await updateProductViaAPI(productId, updatedData);
    
    if (success) {
      alert("Product updated successfully!");
      router.push("/admin/products");
    } else {
      alert("Failed to update product");
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-1 text-gray-600">Update product details and manage inventory</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProductForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          initialData={product}
          mode="edit"
        />
      </div>
    </div>
  );
}
