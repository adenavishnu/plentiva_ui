"use client";

import { Product } from "@/types";
import { FormEvent, useState, useRef } from "react";
import { uploadApi } from "@/lib/api";

interface ProductFormProps {
  onSubmit: (product: Omit<Product, "id">) => void;
  isLoading?: boolean;
}

export default function ProductForm({ onSubmit, isLoading = false }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "INR",
    category: "Electronics",
    image: "/products/default.svg",
    rating: "4.5",
    inStock: true,
  });
  const [imagePreview, setImagePreview] = useState<string>("/products/default.svg");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      setUploadError(null);
      const response = await uploadApi.uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        image: response.file.url,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to upload image";
      setUploadError(errorMsg);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      currency: formData.currency,
      category: formData.category,
      image: formData.image,
      rating: parseFloat(formData.rating),
      inStock: formData.inStock,
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "INR",
      category: "Electronics",
      image: "/products/default.svg",
      rating: "4.5",
      inStock: true,
    });
    setImagePreview("/products/default.svg");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Wireless Headphones"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your product..."
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          required
        />
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Accessories">Accessories</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="space-y-3">
          {/* Preview */}
          {imagePreview && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 max-w-48 rounded object-cover"
              />
            </div>
          )}
          
          {/* Upload Error */}
          {uploadError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {uploadError}
            </div>
          )}

          {/* File Input */}
          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && <p className="text-sm text-gray-600">Uploading image...</p>}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          Rating (1-5)
        </label>
        <input
          id="rating"
          name="rating"
          type="number"
          min="1"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* In Stock */}
      <div className="flex items-center">
        <input
          id="inStock"
          name="inStock"
          type="checkbox"
          checked={formData.inStock}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-600"
        />
        <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
          In Stock
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || uploading}
        className="w-full rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating..." : uploading ? "Uploading..." : "Create Product"}
      </button>
    </form>
  );
}
