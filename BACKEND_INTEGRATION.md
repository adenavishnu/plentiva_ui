# Backend Integration Guide

## ✅ Integration Status

**FULLY INTEGRATED** - All pages now use backend API calls. Hardcoded products have been removed.

## Overview

The Plentiva frontend is fully integrated with Java Spring Boot backend services. All product operations (CRUD) now communicate with your product service on port 8082.

## Architecture

```
Frontend (Next.js) → Next.js API Rewrites → Backend Services
                   ↓
          /api/products/*    → http://localhost:8082/api/products/*
          /api/uploads/*     → http://localhost:8081/api/uploads/*
          /api/v1/payments/* → http://localhost:8080/api/v1/payments/*
```

**Key Features:**
- ✅ No CORS issues (proxied through Next.js)
- ✅ Type-safe API client
- ✅ Automatic UUID ↔ string conversion
- ✅ All pages using async API calls
- ✅ Zero hardcoded products

## Configuration

### Environment Variables (.env.local)

```env
# Backend Service URLs
NEXT_PUBLIC_PRODUCT_URL="http://localhost:8082"
NEXT_PUBLIC_UPLOAD_URL="http://localhost:8081"
NEXT_PUBLIC_PAYMENT_URL="http://localhost:8080"

# Enable backend API (should always be "true" now)
NEXT_PUBLIC_USE_PRODUCT_API="true"

# Razorpay Client Key
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_key_here"
```

## Pages Using Backend API

All product-related pages now make async API calls:

### 1. Home Page (`/`)
```typescript
// src/app/page.tsx
useEffect(() => {
  const loadProducts = async () => {
    const allProducts = await getAllProductsFromAPI();
    setProducts(allProducts);
    setIsLoading(false);
  };
  loadProducts();
}, []);
```

### 2. Admin Products Page (`/admin/products`)
```typescript
// src/app/admin/products/page.tsx
useEffect(() => {
  const loadProducts = async () => {
    const allProducts = await getAllProductsFromAPI();
    setProducts(allProducts);
  };
  loadProducts();
}, []);

// Delete product
const success = await deleteProductViaAPI(productId);

// Update stock
const success = await updateProductViaAPI(id, { stock: newStock });
```

### 3. Create Product Page (`/admin/products/create`)
```typescript
// src/app/admin/products/create/page.tsx
const newProduct = await createProductViaAPI(productData);
```

### 4. Edit Product Page (`/admin/products/edit/[id]`)
```typescript
// src/app/admin/products/edit/[id]/page.tsx
const foundProduct = await getProductByIdFromAPI(productId);
const success = await updateProductViaAPI(productId, updatedData);
```

## API Integration

### Available API Functions

Located in `src/lib/products.ts`:

#### Backend API Functions (Primary)
All pages now use these async functions:

- **`getAllProductsFromAPI()`** → `GET /api/products`
  - Returns: `Promise<Product[]>`
  - Usage: Load all products for display

- **`getProductByIdFromAPI(id)`** → `GET /api/products/{id}`
  - Returns: `Promise<Product | null>`
  - Usage: Load single product for editing

- **`createProductViaAPI(product)`** → `POST /api/products`
  - Returns: `Promise<Product | null>`
  - Usage: Create new product via admin panel

- **`updateProductViaAPI(id, updates)`** → `PATCH /api/products/{id}`
  - Returns: `Promise<boolean>`
  - Usage: Update product details or stock

- **`deleteProductViaAPI(id)`** → `DELETE /api/products/{id}`
  - Returns: `Promise<boolean>`
  - Usage: Remove product from catalogue

#### LocalStorage Functions (Fallback Only)
Only used if `NEXT_PUBLIC_USE_PRODUCT_API="false"`:

- `getAllProducts()` - Returns products from localStorage only (no defaults)
- `addProduct(product)` - Saves to localStorage
- `updateProduct(id, updates)` - Updates in localStorage
- `deleteProduct(id)` - Removes from localStorage

**Note**: Hardcoded/default products have been completely removed. The app now relies entirely on backend data or user-created products (in localStorage mode).

### Type Mapping

Frontend `Product` type:
```typescript
interface Product {
  id: string;          // Maps to UUID from backend
  name: string;
  description: string;
  price: number;
  image: string;       // S3 URL
  category: string;
  stock: number;
  gallery?: string[];  // Array of S3 URLs
}
```

Backend `ProductResponse`:
```java
class ProductResponse {
  UUID id;
  String name;
  String description;
  Double price;
  String image;
  String category;
  Integer stock;
  List<String> gallery;
}
```

## Usage Example

### Creating a Product

```typescript
import { createProductViaAPI } from "@/lib/products";

const newProduct = {
  name: "Wireless Headphones",
  description: "Premium noise-cancelling headphones",
  price: 299.99,
  image: "https://s3.amazonaws.com/...",
  category: "Electronics",
  stock: 50,
  gallery: ["https://s3.amazonaws.com/...", "https://s3.amazonaws.com/..."]
};

const created = await createProductViaAPI(newProduct);
if (created) {
  console.log("Product created:", created.id);
}
```

### Fetching Products

```typescript
import { getAllProductsFromAPI } from "@/lib/products";

const products = await getAllProductsFromAPI();
console.log(`Loaded ${products.length} products`);
```

## Testing

### 1. Start Backend Services

```bash
# Terminal 1 - Payment Service (port 8080)
cd payment-service
mvn spring-boot:run

# Terminal 2 - Upload Service (port 8081)
cd upload-service
mvn spring-boot:run

# Terminal 3 - Product Service (port 8082)
cd product-service
mvn spring-boot:run
```

### 2. Start Frontend

```bash
# Terminal 4 - Frontend
npm run dev
```

### 3. Verify Integration

1. Go to http://localhost:3000
2. Navigate to Admin → Products
3. Try creating a new product
4. Check your backend logs to verify the API call

## Switching Between Modes

### Use Backend API
```env
NEXT_PUBLIC_USE_PRODUCT_API="true"
```

### Use LocalStorage (for development/testing)
```env
NEXT_PUBLIC_USE_PRODUCT_API="false"
```

## CORS Configuration

No CORS configuration needed! Next.js rewrites handle proxying requests to your backend services transparently.

## Troubleshooting

### No Products Displayed

**Symptom**: Home page shows empty state or loading spinner indefinitely

**Solutions**:
1. **Check backend is running**
   ```bash
   netstat -ano | findstr :8082  # Windows
   lsof -i :8082                 # Mac/Linux
   ```

2. **Check browser console**
   - Open DevTools (F12) → Console tab
   - Look for fetch errors like "Failed to fetch" or "net::ERR_CONNECTION_REFUSED"

3. **Check Network tab**
   - DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Look for failed requests to `/api/products`

4. **Verify environment variables**
   ```bash
   # Check .env.local exists and has correct values
   cat .env.local  # Mac/Linux
   Get-Content .env.local  # Windows PowerShell
   ```

5. **Restart dev server** (to pick up .env changes)
   ```bash
   # Kill all node processes
   taskkill /F /IM node.exe  # Windows
   pkill node                # Mac/Linux
   
   # Restart
   npm run dev
   ```

### API Calls Failing

**Symptom**: Network tab shows 404 or 500 errors

**Solutions**:
1. **Verify backend endpoint**
   - Open http://localhost:8082/api/products in browser
   - Should see JSON array of products

2. **Check Next.js rewrites**
   - Verify `next.config.ts` has correct rewrite rules
   - Restart dev server after changes

3. **Check backend logs**
   - Look for errors in Spring Boot console
   - Verify database connection is working

### Products Created But Not Persisting

**Symptom**: Can create products but they disappear on refresh

**Possible Causes**:
1. **Backend not saving to database**
   - Check backend logs for save errors
   - Verify database connection string

2. **Using localStorage mode accidentally**
   - Verify `NEXT_PUBLIC_USE_PRODUCT_API="true"` in .env.local
   - Restart dev server

### CORS Errors (Should Not Happen)

**Symptom**: Console shows "blocked by CORS policy"

**This shouldn't happen** with Next.js rewrites, but if it does:
1. Verify requests go to `/api/products` (not `http://localhost:8082`)
2. Check `next.config.ts` rewrites are configured
3. Restart Next.js dev server

### Backend Connection Refused

**Symptom**: `fetch failed` or `ECONNREFUSED` errors

**Solutions**:
1. **Start backend service**
   ```bash
   cd product-service
   mvn spring-boot:run
   ```

2. **Check port availability**
   ```bash
   # Windows
   netstat -ano | findstr :8082
   
   # Mac/Linux  
   lsof -i :8082
   ```

3. **Change backend port if needed**
   - Update `application.properties` in backend
   - Update `NEXT_PUBLIC_PRODUCT_URL` in frontend .env.local

### Images Not Loading

**Symptom**: Product images show broken image icon

**Solutions**:
1. **Verify S3 URLs are valid**
   - Copy image URL from product data
   - Paste in browser to test

2. **Check Next.js image config**
   ```typescript
   // next.config.ts
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'your-bucket.s3.amazonaws.com',
       },
     ],
   }
   ```

3. **Ensure upload service is running** (port 8081)

### Type Errors

**Symptom**: TypeScript errors about Product types

**Solutions**:
1. **Verify types match backend**
   - Check `src/types/order.ts` Product interface
   - Compare with backend ProductResponse class

2. **Clear TypeScript cache**
   ```bash
   # Delete .next directory
   rm -rf .next  # Mac/Linux
   Remove-Item -Recurse -Force .next  # Windows PowerShell
   ```

## Switching Modes

### Using Backend API (Production Mode)
```env
NEXT_PUBLIC_USE_PRODUCT_API="true"
```
- All data from backend service
- Changes persist to database
- Requires backend running

### Using localStorage (Testing Only)
```env
NEXT_PUBLIC_USE_PRODUCT_API="false"
```
- All data stored in browser localStorage
- No backend required
- Data cleared when localStorage is cleared
- **No default products** - starts empty

## Production Deployment

### Environment Variables

Update `.env.production`:
```env
NEXT_PUBLIC_PRODUCT_URL="https://api.yourdomain.com/products"
NEXT_PUBLIC_UPLOAD_URL="https://api.yourdomain.com/uploads"
NEXT_PUBLIC_PAYMENT_URL="https://api.yourdomain.com/payments"
NEXT_PUBLIC_USE_PRODUCT_API="true"
```

### Next.js Rewrites

Update `next.config.ts` for production:
```typescript
const isProduction = process.env.NODE_ENV === 'production';

const config: NextConfig = {
  async rewrites() {
    if (isProduction) {
      return [
        {
          source: '/api/products/:path*',
          destination: 'https://api.yourdomain.com/products/:path*',
        },
        // ... other rewrites
      ];
    }
    // Development rewrites (localhost)
    return [/* ... */];
  },
};
```

## API Reference Quick Guide

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| `getAllProductsFromAPI()` | GET | `/api/products` | `Product[]` |
| `getProductByIdFromAPI(id)` | GET | `/api/products/{id}` | `Product \| null` |
| `createProductViaAPI(data)` | POST | `/api/products` | `Product \| null` |
| `updateProductViaAPI(id, data)` | PATCH | `/api/products/{id}` | `boolean` |
| `deleteProductViaAPI(id)` | DELETE | `/api/products/{id}` | `boolean` |

## Migration Completed

### ✅ What's Been Done

1. **API Functions Created**
   - All CRUD operations implemented in `src/lib/api.ts`
   - Type-safe API client with automatic JSON handling

2. **Pages Updated to Async**
   - Home page → `getAllProductsFromAPI()`
   - Admin products → `getAllProductsFromAPI()`, `deleteProductViaAPI()`, `updateProductViaAPI()`
   - Create page → `createProductViaAPI()`
   - Edit page → `getProductByIdFromAPI()`, `updateProductViaAPI()`

3. **Hardcoded Products Removed**
   - `defaultProducts` array emptied
   - All "prod-0" ID prefix checks removed
   - All products now treated equally (no "default" restrictions)

4. **Next.js Proxy Configured**
   - Three rewrite rules in `next.config.ts`
   - CORS handled automatically

### 🚀 Getting Started

1. **Start Backend Services**
   ```bash
   # Product Service (REQUIRED)
   cd product-service && mvn spring-boot:run  # Port 8082
   
   # Upload Service (for file management)
   cd upload-service && mvn spring-boot:run   # Port 8081
   
   # Payment Service (for checkout)
   cd payment-service && mvn spring-boot:run  # Port 8080
   ```

2. **Start Frontend**
   ```bash
   npm run dev  # Port 3000
   ```

3. **Create Your First Product**
   - Navigate to http://localhost:3000/admin/products
   - Click "Add New Product"
   - Fill in details and upload images
   - Submit → API call to POST /api/products

4. **Verify API Integration**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Visit home page
   - See API call to `/api/products`

### 📊 Current Data Flow

```
User Action → Frontend Component → API Function → Next.js Proxy → Backend Service
                                                        ↓
User Sees Result ← Frontend Update ← JSON Response ← HTTP Response
```

**Example: Loading Products**
```
Page Load → useEffect → getAllProductsFromAPI() → fetch('/api/products')
  → Next.js rewrites to localhost:8082 → Spring Boot Controller
  → ProductService.findAll() → Database Query → JSON Response
  → Frontend renders ProductCard components
```

## Support

For issues or questions, check:
- Frontend logs: Browser console
- Backend logs: Terminal running Spring Boot
- Network tab: Verify API requests are being made correctly
