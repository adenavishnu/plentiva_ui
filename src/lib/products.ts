import { Product } from "@/types";

/**
 * Mock product catalogue with client-side storage support.
 * Replace with a real product-service API call when ready.
 */
const defaultProducts: Product[] = [
  {
    id: "prod-001",
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 249.99,
    currency: "INR",
    image: "/products/headphones.svg",
    category: "Electronics",
    rating: 4.7,
    inStock: true,
  },
  {
    id: "prod-002",
    name: "Mechanical Keyboard RGB",
    description:
      "Hot-swappable mechanical keyboard with per-key RGB lighting and Cherry MX switches.",
    price: 129.99,
    currency: "INR",
    image: "/products/keyboard.svg",
    category: "Electronics",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "prod-003",
    name: "Ultra-Wide 34\" Monitor",
    description:
      "34-inch curved ultra-wide QHD monitor, 144 Hz refresh rate, 1 ms response time.",
    price: 599.99,
    currency: "INR",
    image: "/products/monitor.svg",
    category: "Electronics",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "prod-004",
    name: "Ergonomic Office Chair",
    description:
      "Adjustable lumbar support, breathable mesh back, and reclining mechanism.",
    price: 349.99,
    currency: "INR",
    image: "/products/chair.svg",
    category: "Furniture",
    rating: 4.3,
    inStock: true,
  },
  {
    id: "prod-005",
    name: "Smart Watch Pro",
    description:
      "AMOLED display, health tracking, GPS, and 7-day battery life.",
    price: 199.99,
    currency: "INR",
    image: "/products/watch.svg",
    category: "Electronics",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "prod-006",
    name: "Portable Bluetooth Speaker",
    description:
      "Waterproof IPX7 speaker with 360° sound and 20-hour playtime.",
    price: 79.99,
    currency: "INR",
    image: "/products/speaker.svg",
    category: "Electronics",
    rating: 4.4,
    inStock: false,
  },
];

let customProducts: Product[] = [];

// ── Product Management ────────────────────────────────────────────────────────

/**
 * Get all products (default + custom)
 */
export function getAllProducts(): Product[] {
  if (typeof window === "undefined") {
    return defaultProducts;
  }
  
  const stored = localStorage.getItem("custom_products");
  if (stored) {
    customProducts = JSON.parse(stored);
  }
  return [...defaultProducts, ...customProducts];
}

/**
 * Add a new product
 */
export function addProduct(product: Omit<Product, "id">): Product {
  if (typeof window === "undefined") {
    throw new Error("Products can only be added in the browser");
  }

  const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newProduct: Product = { ...product, id };
  
  const stored = localStorage.getItem("custom_products");
  customProducts = stored ? JSON.parse(stored) : [];
  customProducts.push(newProduct);
  
  localStorage.setItem("custom_products", JSON.stringify(customProducts));
  return newProduct;
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  const allProducts = getAllProducts();
  return allProducts.find((p) => p.id === id);
}

/**
 * Delete a custom product
 */
export function deleteProduct(id: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (id.startsWith("prod-0")) {
    return false; // Cannot delete default products
  }

  const stored = localStorage.getItem("custom_products");
  customProducts = stored ? JSON.parse(stored) : [];
  customProducts = customProducts.filter((p) => p.id !== id);
  
  localStorage.setItem("custom_products", JSON.stringify(customProducts));
  return true;
}

export const products = defaultProducts;
