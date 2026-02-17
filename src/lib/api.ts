import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  ApiError,
  Product,
} from "@/types";

// ── Base URLs ────────────────────────────────────────────────────────────────
// All requests go through Next.js rewrites → no CORS, no domain switching.
const PAYMENTS_ENDPOINT = "/api/v1/payments";
const UPLOADS_ENDPOINT = "/api/uploads/file";
const PRODUCTS_ENDPOINT = "/api/catalog/products";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      status: res.status,
      message: res.statusText,
      timestamp: new Date().toISOString(),
    }));
    throw error;
  }
  return res.json();
}

function jsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── Payment API Client ──────────────────────────────────────────────────────

export const paymentApi = {
  /** POST /api/v1/payments — Initiate a payment */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const res = await fetch(PAYMENTS_ENDPOINT, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** GET /api/v1/payments/:paymentId */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}`, {
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** GET /api/v1/payments/order/:orderId */
  async getPaymentsByOrder(orderId: string): Promise<PaymentResponse[]> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/order/${orderId}`, {
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse[]>(res);
  },

  /** POST /api/v1/payments/:paymentId/verify */
  async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}/verify`, {
      method: "POST",
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** POST /api/v1/payments/:paymentId/refund */
  async refundPayment(
    paymentId: string,
    request: RefundRequest
  ): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}/refund`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<PaymentResponse>(res);
  },

  /** POST /api/v1/payments/:paymentId/cancel */
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    const res = await fetch(`${PAYMENTS_ENDPOINT}/${paymentId}/cancel`, {
      method: "POST",
      headers: jsonHeaders(),
    });
    return handleResponse<PaymentResponse>(res);
  },
};

// ── File Upload API Client ──────────────────────────────────────────────────

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    id?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    s3Url: string;  // The actual file URL from S3
    s3Key: string;  // The S3 object key
    uploadStatus?: string;
  };
}

export const uploadApi = {
  /** POST /api/uploads/file — Upload a file to backend */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch(UPLOADS_ENDPOINT, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Upload failed");
    }
    
    return res.json();
  },

  /** DELETE /api/uploads/file — Delete a file from backend */
  async deleteFile(s3Key: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/uploads/file?s3Key=${encodeURIComponent(s3Key)}`, {
      method: "DELETE",
      headers: jsonHeaders(),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Delete failed");
    }
    
    return res.json();
  },

  /** PUT /api/uploads/:uploadId — Replace an existing file */
  async updateFile(uploadId: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch(`/api/uploads/${uploadId}`, {
      method: "PUT",
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Update failed");
    }
    
    return res.json();
  }
};

// ── Product API Client ──────────────────────────────────────────────────────

// ── Category API Client ─────────────────────────────────────────────────────
import { Category } from "@/types";

const CATEGORIES_ENDPOINT = "/api/catalog/categories";

export interface CategoryRequest {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  parentId?: string;
}

export interface CategoryResponse extends Category {
  createdAt?: string;
  updatedAt?: string;
  dateCreated?: string;
}

export const categoryApi = {
  /** GET /api/catalog/categories — Get all categories */
  async getAllCategories(): Promise<CategoryResponse[]> {
    const res = await fetch(CATEGORIES_ENDPOINT, {
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to fetch categories");
    }
    return res.json();
  },

  /** GET /api/catalog/categories/:id — Get category by ID */
  async getCategoryById(id: string): Promise<CategoryResponse> {
    const res = await fetch(`${CATEGORIES_ENDPOINT}/${id}`, {
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to fetch category");
    }
    return res.json();
  },

  /** POST /api/catalog/categories — Create a new category */
  async createCategory(category: CategoryRequest): Promise<CategoryResponse> {
    const res = await fetch(CATEGORIES_ENDPOINT, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to create category");
    }
    return res.json();
  },

  /** PUT /api/catalog/categories/:id — Update a category */
  async updateCategory(id: string, category: CategoryRequest): Promise<CategoryResponse> {
    const res = await fetch(`${CATEGORIES_ENDPOINT}/${id}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to update category");
    }
    return res.json();
  },

  /** DELETE /api/catalog/categories/:id — Delete a category */
  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${CATEGORIES_ENDPOINT}/${id}`, {
      method: "DELETE",
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to delete category");
    }
  },
};

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  gallery?: string[];
}
export interface ImageRef {
  imageId: string;
  url: string;
}

export interface ProductResponse {
   category: {
        dateCreated: string,
        description: string,
        displayOrder: number,
        id: string,
        imageUrl: string,
        isActive: boolean,
        name: string,
        parentId: string | null,
        slug: string
    },
    description: string,
    id: string,
    price: number,
    productGallery: ImageRef[]|null,
    productName: string,
    quantity: number,
    thumbnail: ImageRef
}

export const productApi = {
  /** GET /api/catalog/products — Get all products */
  async getAllProducts(): Promise<ProductResponse[]> {
    const res = await fetch(PRODUCTS_ENDPOINT, {
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to fetch products");
    }
    return res.json();
  },

  /** GET /api/catalog/products/:id — Get product by ID */
  async getProductById(id: string): Promise<ProductResponse> {
    const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to fetch product");
    }
    return res.json();
  },

  /** POST /api/catalog/products — Create a new product */
  async createProduct(product: ProductRequest): Promise<ProductResponse> {
    const res = await fetch(PRODUCTS_ENDPOINT, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to create product");
    }
    return res.json();
  },

  /** PUT /api/catalog/products/:id — Update a product */
  async updateProduct(id: string, product: ProductRequest): Promise<ProductResponse> {
    const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to update product");
    }
    return res.json();
  },

  /** DELETE /api/catalog/products/:id — Delete a product */
  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: "DELETE",
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to delete product");
    }
  },

  /** GET /api/catalog/products/category/:categoryId — Get products by category */
  async getProductsByCategory(categoryId: string): Promise<ProductResponse[]> {
    const res = await fetch(`${PRODUCTS_ENDPOINT}/category/${categoryId}`, {
      headers: jsonHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: res.statusText,
      }));
      throw new Error(error.message || "Failed to fetch products by category");
    }
    return res.json();
  },
};

