import { Product, ProductHistory, StockUpdate, ProductAnalytics } from "@/types";
import { productApi, ProductRequest } from "./api";

// ── Configuration ────────────────────────────────────────────────────────────

// Set to true to use backend API, false for localStorage
const USE_BACKEND_API = process.env.NEXT_PUBLIC_USE_PRODUCT_API === "true";

// ── Backend API Functions ───────────────────────────────────────────────────

/**
 * Get all products from backend API
 */
export async function getAllProductsFromAPI(): Promise<Product[]> {
  try {
    const products = await productApi.getAllProducts();
    return products.map((p: any) => ({
      id: p.id,
      name: p.productName ?? p.name,
      description: p.description,
      price: p.price,
      image: p.thumbnail?.url ?? p.image,
      category: p.category?.name ?? p.category ?? p.categoryId,
      stock: p.quantity ?? p.stock,
      gallery: Array.isArray(p.productGallery)
        ? p.productGallery.map((img: any) => img.url)
        : p.gallery,
    }));
  } catch (error) {
    console.error("Failed to fetch products from API:", error);
    return [];
  }
}

/**
 * Get product by ID from backend API
 */
export async function getProductByIdFromAPI(id: string): Promise<Product | null> {
  try {
    const p = await productApi.getProductById(id);
    return {
      id: p.id,
      name: p.productName ?? p.name,
      description: p.description,
      price: p.price,
      image: p.thumbnail?.url ?? p.image,
      category: p.category?.name ?? p.category ?? p.categoryId,
      stock: p.quantity ?? p.stock,
      gallery: Array.isArray(p.productGallery)
        ? p.productGallery.map((img: any) => img.url)
        : p.gallery,
    };
  } catch (error) {
    console.error("Failed to fetch product from API:", error);
    return null;
  }
}

/**
 * Create a product via backend API
 */
export async function createProductViaAPI(product: any): Promise<any | null> {
  try {
    // Build payload matching backend DTO
    const request = {
      productName: product.productName || product.name,
      price: product.price,
      categoryId: product.categoryId || product.category?.id || product.category,
      quantity: product.quantity || product.stock,
      description: product.description,
      thumbnail: product.thumbnail || (product.image ? { url: product.image } : undefined),
      productGallery: product.productGallery || (product.gallery ? product.gallery.map((url: string) => ({ url })) : undefined),
    };
    const created = await productApi.createProduct(request);
    return created;
  } catch (error) {
    console.error("Failed to create product via API:", error);
    return null;
  }
}

/**
 * Update a product via backend API
 */
export async function updateProductViaAPI(id: string, updates: any): Promise<boolean> {
  try {
    // Fetch the existing product first to ensure all fields are present
    const allProducts = await getAllProductsFromAPI();
    const existing = allProducts.find(p => p.id === id);
    if (!existing) throw new Error("Product not found");
    const request = {
      productName: updates.productName ?? updates.name ?? existing.name,
      price: updates.price ?? existing.price,
      categoryId: updates.categoryId ?? updates.category?.id ?? existing.category?.id ?? existing.category,
      quantity: updates.quantity ?? updates.stock ?? existing.stock,
      description: updates.description ?? existing.description,
      thumbnail: updates.thumbnail || (updates.image ? { url: updates.image } : existing.image ? { url: existing.image } : undefined),
      productGallery: updates.productGallery || (updates.gallery ? updates.gallery.map((url: string) => ({ url })) : existing.gallery ? existing.gallery.map((url: string) => ({ url })) : undefined),
    };
    await productApi.updateProduct(id, request);
    return true;
  } catch (error) {
    console.error("Failed to update product via API:", error);
    return false;
  }
}

/**
 * Delete a product via backend API
 */
export async function deleteProductViaAPI(id: string): Promise<boolean> {
  try {
    await productApi.deleteProduct(id);
    return true;
  } catch (error) {
    console.error("Failed to delete product via API:", error);
    return false;
  }
}

// ── LocalStorage Functions (Fallback) ──────────────────────────────────────

/**
 * Product storage using localStorage only.
 * No default/mock products - all products come from backend API or user creation.
 */
const defaultProducts: Product[] = [];

let customProducts: Product[] = [];

// ── Product Management ────────────────────────────────────────────────────────

/**
 * Get all products (custom only from localStorage)
 */
export function getAllProducts(): Product[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const stored = localStorage.getItem("custom_products");
  if (stored) {
    customProducts = JSON.parse(stored);
  }
  return customProducts;
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
  
  // Initialize history tracking
  initializeProductHistory(id, newProduct.stock);
  
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
 * Update an existing product
 */
export function updateProduct(id: string, updates: Partial<Omit<Product, "id">>): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = localStorage.getItem("custom_products");
  customProducts = stored ? JSON.parse(stored) : [];
  
  const index = customProducts.findIndex((p) => p.id === id);
  if (index === -1) {
    return false;
  }

  customProducts[index] = { ...customProducts[index], ...updates };
  localStorage.setItem("custom_products", JSON.stringify(customProducts));
  return true;
}

/**
 * Update stock quantity for a product
 */
export function updateStock(id: string, quantity: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = localStorage.getItem("custom_products");
  customProducts = stored ? JSON.parse(stored) : [];
  
  const index = customProducts.findIndex((p) => p.id === id);
  if (index === -1) {
    return false;
  }

  const oldQuantity = customProducts[index].stock;
  const newQuantity = Math.max(0, quantity);
  
  customProducts[index].stock = newQuantity;
  localStorage.setItem("custom_products", JSON.stringify(customProducts));
  
  // Record the stock update in history
  recordStockUpdate(id, newQuantity, oldQuantity);
  
  return true;
}

/**
 * Delete a custom product
 */
export function deleteProduct(id: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = localStorage.getItem("custom_products");
  customProducts = stored ? JSON.parse(stored) : [];
  customProducts = customProducts.filter((p) => p.id !== id);
  
  localStorage.setItem("custom_products", JSON.stringify(customProducts));
  return true;
}

// ── Product History & Analytics ──────────────────────────────────────────────

/**
 * Initialize history tracking for a new product
 */
export function initializeProductHistory(productId: string, initialStock: number): void {
  if (typeof window === "undefined") return;

  const historiesRaw = localStorage.getItem("product_histories");
  const histories: Record<string, ProductHistory> = historiesRaw ? JSON.parse(historiesRaw) : {};

  if (histories[productId]) return; // Already initialized

  histories[productId] = {
    productId,
    initialStock,
    stockUpdates: [{
      date: new Date().toISOString(),
      quantity: initialStock,
      type: 'initial',
      notes: 'Initial stock'
    }],
    totalAdded: initialStock,
    totalSold: 0,
    currentStock: initialStock,
    totalRevenue: 0,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("product_histories", JSON.stringify(histories));
}

/**
 * Record a stock update (add or remove inventory)
 */
export function recordStockUpdate(
  productId: string, 
  newQuantity: number, 
  oldQuantity: number,
  notes?: string
): void {
  if (typeof window === "undefined") return;

  const historiesRaw = localStorage.getItem("product_histories");
  const histories: Record<string, ProductHistory> = historiesRaw ? JSON.parse(historiesRaw) : {};

  if (!histories[productId]) {
    initializeProductHistory(productId, oldQuantity);
  }

  const history = histories[productId];
  const difference = newQuantity - oldQuantity;
  
  if (difference !== 0) {
    const update: StockUpdate = {
      date: new Date().toISOString(),
      quantity: Math.abs(difference),
      type: difference > 0 ? 'add' : 'remove',
      notes: notes || (difference > 0 ? 'Stock added' : 'Stock removed')
    };

    history.stockUpdates.push(update);
    
    if (difference > 0) {
      history.totalAdded += difference;
    }
    
    history.currentStock = newQuantity;
    localStorage.setItem("product_histories", JSON.stringify(histories));
  }
}

/**
 * Record a sale (decrements stock and adds revenue)
 */
export function recordSale(productId: string, quantity: number, pricePerUnit: number): void {
  if (typeof window === "undefined") return;

  const historiesRaw = localStorage.getItem("product_histories");
  const histories: Record<string, ProductHistory> = historiesRaw ? JSON.parse(historiesRaw) : {};

  const product = getProductById(productId);
  if (!product) return;

  if (!histories[productId]) {
    initializeProductHistory(productId, product.stock + quantity);
  }

  const history = histories[productId];
  
  const sale: StockUpdate = {
    date: new Date().toISOString(),
    quantity,
    type: 'sold',
    notes: `Sold ${quantity} units at ${pricePerUnit.toFixed(2)} each`
  };

  history.stockUpdates.push(sale);
  history.totalSold += quantity;
  history.currentStock = Math.max(0, history.currentStock - quantity);
  history.totalRevenue += (quantity * pricePerUnit);

  localStorage.setItem("product_histories", JSON.stringify(histories));
}

/**
 * Get analytics for a specific product
 */
export function getProductAnalytics(productId: string): ProductAnalytics | null {
  debugger
  if (typeof window === "undefined") return null;

  const historiesRaw = localStorage.getItem("product_histories");
  const histories: Record<string, ProductHistory> = historiesRaw ? JSON.parse(historiesRaw) : {};

  const history = histories[productId];
  if (!history) return null;

  const product = getProductById(productId);
  if (!product) return null;

  return {
    productId,
    productName: product.name,
    initialStock: history.initialStock,
    totalUpdates: history.stockUpdates.filter(u => u.type === 'add' || u.type === 'remove').length,
    totalAdded: history.totalAdded,
    totalSold: history.totalSold,
    currentStock: product.stock,
    totalRevenue: history.totalRevenue,
    lastUpdated: history.stockUpdates[history.stockUpdates.length - 1]?.date || history.createdAt,
    history: history.stockUpdates
  };
}

/**
 * Get all product histories
 */
export function getAllProductHistories(): Record<string, ProductHistory> {
  if (typeof window === "undefined") return {};

  const historiesRaw = localStorage.getItem("product_histories");
  return historiesRaw ? JSON.parse(historiesRaw) : {};
}

/**
 * Process a completed order - record sales and update stock
 */
export function processCompletedOrder(orderId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    // Mark order as processed to avoid duplicate processing
    const processedOrdersRaw = localStorage.getItem("processed_orders");
    const processedOrders: string[] = processedOrdersRaw ? JSON.parse(processedOrdersRaw) : [];
    
    if (processedOrders.includes(orderId)) {
      console.log(`Order ${orderId} already processed`);
      return true; // Already processed
    }

    // Get the order from cart context orders
    const ordersRaw = localStorage.getItem("cart_orders");
    const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
    const order = orders.find((o: { id: string }) => o.id === orderId);

    if (!order || !order.items) {
      console.warn(`Order ${orderId} not found or has no items`);
      return false;
    }

    console.log(`Processing order ${orderId} with ${order.items.length} items`);

    // Process each item in the order
    order.items.forEach((item: { product: Product; quantity: number }) => {
      const { product, quantity } = item;
      
      // Record the sale
      recordSale(product.id, quantity, product.price);
      
      // Update stock (decrement)
      const currentProduct = getProductById(product.id);
      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stock - quantity);
        updateStock(product.id, newStock);
        console.log(`Updated stock for ${product.name}: ${currentProduct.stock} → ${newStock}`);
      }
    });

    // Mark order as processed
    processedOrders.push(orderId);
    localStorage.setItem("processed_orders", JSON.stringify(processedOrders));

    console.log(`Order ${orderId} processed successfully`);
    return true;
  } catch (error) {
    console.error("Error processing order:", error);
    return false;
  }
}

export const products = defaultProducts;
