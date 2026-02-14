"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types";
import { getProductById } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = () => {
      const foundProduct = getProductById(productId);
      if (!foundProduct) {
        router.push("/");
        return;
      }
      setProduct(foundProduct);
      setSelectedImage(foundProduct.image);
      
      // Debug: Log gallery images
      console.log("Product loaded:", foundProduct.name);
      console.log("Gallery images:", foundProduct.gallery);
    };
    
    loadProduct();
  }, [productId, router]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
    }
  };

  const handleBuyNow = () => {
    if (product) {
      handleAddToCart();
      router.push("/cart");
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  // Use gallery images if available, including the main thumbnail
  // Filter out duplicates in case thumbnail is also in gallery
  const galleryImages = product.gallery && product.gallery.length > 0 
    ? [product.image, ...product.gallery.filter(img => img !== product.image)]
    : [product.image];

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowBackIcon fontSize="small" />
        Back to Products
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Image Counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {galleryImages.findIndex(img => img === selectedImage) + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-4 gap-4 min-w-0">
                {galleryImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === img
                        ? "border-purple-600 ring-2 ring-purple-600 ring-offset-2"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={`View image ${index + 1}`}
                    aria-label={`View ${product.name} image ${index + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col gap-6">
          {/* Product Name & Category */}
          <div>
            <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              {product.name}
            </h1>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between border-b border-t border-gray-200 py-4">
            <div>
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              <p className="mt-1 text-sm text-gray-500">Inclusive of all taxes</p>
            </div>
            <div>
              {product.stock > 0 ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <LocalShippingIcon className="text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <VerifiedUserIcon className="text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure transactions</p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={product.stock === 0}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="h-10 w-20 rounded-lg border border-gray-300 text-center font-semibold text-gray-900"
                disabled={product.stock === 0}
                title="Quantity"
                aria-label="Product quantity"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="h-10 w-10 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={product.stock === 0}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-purple-600 bg-white px-6 py-3 font-semibold text-purple-600 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCartIcon fontSize="small" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Product Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Product ID:</dt>
                <dd className="font-medium text-gray-900">{product.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Category:</dt>
                <dd className="font-medium text-gray-900">{product.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Availability:</dt>
                <dd className="font-medium text-gray-900">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
