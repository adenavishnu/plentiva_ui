"use client";

import { Product } from "@/types";
import { FormEvent, useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCategories } from '@/store/categoriesSlice';
import { useForm, Controller } from "react-hook-form";
import MediaUploader from "./common/MediaUploader";

interface ProductFormProps {
  onSubmit: (product: Omit<Product, "id">) => void;
  isLoading?: boolean;
  initialData?: Product;
  mode?: "create" | "edit";
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export default function ProductForm({ onSubmit, isLoading = false, initialData, mode = "create" }: ProductFormProps) {
  const { control, watch } = useForm<{
    thumbnail: UploadedFile[];
    gallery: UploadedFile[];
  }>({
    defaultValues: {
      thumbnail: initialData?.image ? [{ url: initialData.image, name: "thumbnail", size: 0 }] : [],
      gallery: initialData?.gallery 
        ? initialData.gallery.map((url, index) => ({ url, name: `gallery-${index}`, size: 0 }))
        : [],
    }
  });
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    category: initialData?.category || "",
    image: initialData?.image || "/products/default.svg",
    stock: initialData?.stock?.toString() || "0",
  });

  const dispatch = useAppDispatch();
  const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      // @ts-expect-error: Redux thunk type mismatch, safe to ignore for dispatching async thunk
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  const thumbnail = watch("thumbnail");
  const gallery = watch("gallery");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    // Get thumbnail URL from MediaUploader
    const thumbnailUrl = thumbnail && thumbnail.length > 0 ? thumbnail[0].url : "/products/default.svg";
    
    // Get gallery URLs from MediaUploader
    const galleryUrls = gallery && gallery.length > 0 ? gallery.map(img => img.url) : [];

    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: thumbnailUrl,
      stock: parseInt(formData.stock) || 0,
      gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      price: "",
      category: categories && categories.length > 0 ? categories[0].name : "",
      image: "/products/default.svg",
      stock: "0",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Product Name
          <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Wireless Headphones"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your product..."
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Price (INR)
          <span className="text-red-500">*</span>
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        >
          <option value="" disabled>
            {categoriesLoading ? "Loading..." : "Select a category"}
          </option>
          {categories && categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Product Thumbnail */}
      <div>
        <label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Product Thumbnail
          <span className="text-red-500">*</span>
        </label>
        <Controller
          name="thumbnail"
          control={control}
          render={({ field }) => (
            <MediaUploader
              multiple={false}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Product Gallery */}
      <div>
        <label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Product Gallery
          <span className="text-sm font-normal text-gray-500">(Multiple Images)</span>
        </label>
        <Controller
          name="gallery"
          control={control}
          render={({ field }) => (
            <MediaUploader
              multiple={true}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Stock Quantity */}
      <div>
        <label htmlFor="stock" className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">●</span>
          Stock Quantity
          <span className="text-red-500">*</span>
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={formData.stock}
          onChange={handleChange}
          placeholder="0"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading 
          ? (mode === "edit" ? "Updating..." : "Creating...")
          : (mode === "edit" ? "Update Product" : "Create Product")
        }
      </button>
    </form>
  );
}
