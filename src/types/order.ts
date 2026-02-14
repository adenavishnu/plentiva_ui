// ── Product & Cart types (local, not from backend) ──────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  gallery?: string[]; // Optional array of additional product images
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

// ── Product History & Analytics ─────────────────────────────────────────────

export interface StockUpdate {
  date: string;
  quantity: number;
  type: 'initial' | 'add' | 'remove' | 'sold';
  notes?: string;
}

export interface ProductHistory {
  productId: string;
  initialStock: number;
  stockUpdates: StockUpdate[];
  totalAdded: number;
  totalSold: number;
  currentStock: number;
  totalRevenue: number;
  createdAt: string;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  initialStock: number;
  totalUpdates: number;
  totalAdded: number;
  totalSold: number;
  currentStock: number;
  totalRevenue: number;
  lastUpdated: string;
  history: StockUpdate[];
}
