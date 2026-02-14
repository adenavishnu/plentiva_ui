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
const PRODUCTS_ENDPOINT = "/api/products";

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

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  gallery?: string[];
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  gallery?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const productApi = {
  /** GET /api/products — Get all products */
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

  /** GET /api/products/:id — Get product by ID */
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

  /** POST /api/products — Create a new product */
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

  /** PATCH /api/products/:id — Update a product */
  async updateProduct(id: string, product: Partial<ProductRequest>): Promise<ProductResponse> {
    const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: "PATCH",
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

  /** DELETE /api/products/:id — Delete a product */
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
};

