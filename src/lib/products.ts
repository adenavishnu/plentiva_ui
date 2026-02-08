import { Product } from "@/types";

/**
 * Mock product catalogue.
 * Replace with a real product-service API call when ready.
 */
export const products: Product[] = [
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
