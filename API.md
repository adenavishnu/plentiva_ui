# API Documentation

Complete API reference for the Plentiva e-commerce platform.

## Table of Contents

- [Product API](#product-api)
- [Upload API](#upload-api)
- [Payment API](#payment-api)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)

---

## Product API

Base URL: `/api/products` (proxied to `http://localhost:8082/api/products`)

### Get All Products

**Endpoint**: `GET /api/products`

**Description**: Retrieve all products from the catalogue

**Request**: No parameters

**Response**: `200 OK`
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Wireless Headphones",
    "description": "Premium noise-cancelling headphones with 30hr battery",
    "price": 299.99,
    "image": "https://s3.amazonaws.com/bucket/headphones.jpg",
    "category": "Electronics",
    "stock": 50,
    "gallery": [
      "https://s3.amazonaws.com/bucket/headphones-1.jpg",
      "https://s3.amazonaws.com/bucket/headphones-2.jpg"
    ]
  }
]
```

**Frontend Usage**:
```typescript
import { getAllProductsFromAPI } from "@/lib/products";

const products = await getAllProductsFromAPI();
```

---

### Get Product by ID

**Endpoint**: `GET /api/products/{id}`

**Description**: Retrieve a single product by its ID

**Path Parameters**:
- `id` (UUID string) - Product identifier

**Response**: `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones",
  "price": 299.99,
  "image": "https://s3.amazonaws.com/bucket/headphones.jpg",
  "category": "Electronics",
  "stock": 50,
  "gallery": ["url1", "url2"]
}
```

**Error Responses**:
- `404 Not Found` - Product does not exist

**Frontend Usage**:
```typescript
import { getProductByIdFromAPI } from "@/lib/products";

const product = await getProductByIdFromAPI("123e4567-e89b-12d3-a456-426614174000");
if (product) {
  console.log(product.name);
}
```

---

### Create Product

**Endpoint**: `POST /api/products`

**Description**: Create a new product

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Smart Watch",
  "description": "Fitness tracker with GPS",
  "price": 199.99,
  "image": "https://s3.amazonaws.com/bucket/watch.jpg",
  "category": "Electronics",
  "stock": 100,
  "gallery": ["url1", "url2"]
}
```

**Field Validations**:
- `name`: Required, max 255 chars
- `description`: Required
- `price`: Required, positive number
- `image`: Required, valid URL
- `category`: Required
- `stock`: Required, non-negative integer
- `gallery`: Optional, array of URLs

**Response**: `201 Created`
```json
{
  "id": "new-uuid-generated-by-backend",
  "name": "Smart Watch",
  "description": "Fitness tracker with GPS",
  "price": 199.99,
  "image": "https://s3.amazonaws.com/bucket/watch.jpg",
  "category": "Electronics",
  "stock": 100,
  "gallery": ["url1", "url2"]
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data
- `500 Internal Server Error` - Database error

**Frontend Usage**:
```typescript
import { createProductViaAPI } from "@/lib/products";

const newProduct = await createProductViaAPI({
  name: "Smart Watch",
  description: "Fitness tracker with GPS",
  price: 199.99,
  image: "https://s3.amazonaws.com/bucket/watch.jpg",
  category: "Electronics",
  stock: 100,
  gallery: ["url1", "url2"]
});

if (newProduct) {
  console.log("Created product with ID:", newProduct.id);
}
```

---

### Update Product

**Endpoint**: `PATCH /api/products/{id}`

**Description**: Update an existing product (partial update supported)

**Path Parameters**:
- `id` (UUID string) - Product identifier

**Request Headers**:
```
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "price": 249.99,
  "stock": 75
}
```

**Response**: `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Name",
  "description": "Original description",
  "price": 249.99,
  "image": "https://s3.amazonaws.com/bucket/product.jpg",
  "category": "Electronics",
  "stock": 75,
  "gallery": ["url1"]
}
```

**Error Responses**:
- `404 Not Found` - Product does not exist
- `400 Bad Request` - Invalid update data

**Frontend Usage**:
```typescript
import { updateProductViaAPI } from "@/lib/products";

// Update just the stock
const success = await updateProductViaAPI(productId, { stock: 75 });

// Update multiple fields
const success = await updateProductViaAPI(productId, {
  name: "New Name",
  price: 249.99,
  stock: 75
});
```

---

### Delete Product

**Endpoint**: `DELETE /api/products/{id}`

**Description**: Delete a product from the catalogue

**Path Parameters**:
- `id` (UUID string) - Product identifier

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found` - Product does not exist

**Frontend Usage**:
```typescript
import { deleteProductViaAPI } from "@/lib/products";

const success = await deleteProductViaAPI(productId);
if (success) {
  console.log("Product deleted");
}
```

---

## Upload API

Base URL: `/api/uploads` (proxied to `http://localhost:8081/api/uploads`)

### Upload File(s)

**Endpoint**: `POST /api/uploads`

**Description**: Upload one or more files to S3

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Body**:
```
Form data with file(s) attached
Key: "files" (can be multiple)
```

**Response**: `200 OK`
```json
[
  {
    "id": "file-uuid-1",
    "url": "https://s3.amazonaws.com/bucket/file1.jpg",
    "filename": "product-image.jpg",
    "size": 245632,
    "contentType": "image/jpeg"
  },
  {
    "id": "file-uuid-2",
    "url": "https://s3.amazonaws.com/bucket/file2.jpg",
    "filename": "product-gallery-1.jpg",
    "size": 189422,
    "contentType": "image/jpeg"
  }
]
```

**Frontend Usage**:
```typescript
import { uploadApi } from "@/lib/api";

const handleUpload = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const result = await uploadApi.uploadFile(formData);
  console.log("Uploaded URLs:", result.map(f => f.url));
};
```

---

### Update File

**Endpoint**: `PUT /api/uploads/{id}`

**Description**: Replace an existing file with a new one

**Path Parameters**:
- `id` (UUID string) - File identifier

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Body**:
```
Form data with single file
Key: "file"
```

**Response**: `200 OK`
```json
{
  "id": "file-uuid-1",
  "url": "https://s3.amazonaws.com/bucket/new-file.jpg",
  "filename": "updated-image.jpg",
  "size": 301245,
  "contentType": "image/jpeg"
}
```

**Error Responses**:
- `404 Not Found` - File ID does not exist
- `400 Bad Request` - Invalid file or missing file in request

**Frontend Usage**:
```typescript
import { uploadApi } from "@/lib/api";

const handleReplace = async (fileId: string, newFile: File) => {
  const formData = new FormData();
  formData.append('file', newFile);
  
  const result = await uploadApi.updateFile(fileId, formData);
  console.log("New URL:", result.url);
};
```

---

### Delete File

**Endpoint**: `DELETE /api/uploads/{id}`

**Description**: Delete a file from S3

**Path Parameters**:
- `id` (UUID string) - File identifier

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found` - File does not exist

**Frontend Usage**:
```typescript
import { uploadApi } from "@/lib/api";

const handleDelete = async (fileId: string) => {
  await uploadApi.deleteFile(fileId);
  console.log("File deleted");
};
```

---

## Payment API

Base URL: `/api/v1/payments` (proxied to `http://localhost:8080/api/v1/payments`)

### Create Payment Order

**Endpoint**: `POST /api/v1/payments/create-order`

**Description**: Create a payment order for checkout

**Request Body**:
```json
{
  "userId": "user-id",
  "provider": "razorpay",
  "amount": 599.99,
  "currency": "INR",
  "items": [
    {
      "productId": "product-uuid",
      "name": "Wireless Headphones",
      "price": 299.99,
      "quantity": 2
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "orderId": "order_xyz123",
  "amount": 59999,
  "currency": "INR",
  "provider": "razorpay",
  "razorpayKeyId": "rzp_test_xxx"
}
```

---

### Verify Payment

**Endpoint**: `POST /api/v1/payments/verify`

**Description**: Verify payment signature after completion

**Request Body**:
```json
{
  "orderId": "order_xyz123",
  "paymentId": "pay_abc123",
  "signature": "signature_hash",
  "provider": "razorpay"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "status": "COMPLETED"
}
```

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-02-14T10:30:00Z"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource does not exist
- `500 Internal Server Error` - Server error

### Frontend Error Handling

```typescript
try {
  const product = await getProductByIdFromAPI(id);
  if (!product) {
    console.error("Product not found");
  }
} catch (error) {
  console.error("API error:", error);
  // Show user-friendly error message
}
```

---

## Type Definitions

### Product

```typescript
interface Product {
  id: string;           // UUID from backend
  name: string;
  description: string;
  price: number;        // Decimal price
  image: string;        // S3 URL
  category: string;
  stock: number;        // Integer, non-negative
  gallery?: string[];   // Optional array of S3 URLs
}
```

### ProductRequest

```typescript
interface ProductRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  gallery?: string[];
}
```

### ProductResponse

```typescript
interface ProductResponse {
  id: string;           // UUID as string
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  gallery?: string[];
}
```

### FileResponse

```typescript
interface FileResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
}
```

---

## Rate Limiting

Currently no rate limiting implemented. For production, consider:
- API Gateway rate limiting
- Backend rate limiting (Spring Boot + Redis)
- Frontend request debouncing

## Authentication

Currently no authentication required. For production:
- Add JWT tokens to headers
- Implement OAuth2 / OIDC
- Secure admin routes

## CORS

CORS is handled by Next.js rewrites. All requests go through Next.js proxy:

```
Browser → http://localhost:3000/api/products → http://localhost:8082/api/products
```

No CORS issues because browser sees same origin (localhost:3000).

---

**Last Updated**: February 14, 2026  
**API Version**: 1.0  
**Frontend Version**: Next.js 15 + TypeScript
