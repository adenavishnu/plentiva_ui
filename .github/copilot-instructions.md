# Plentiva UI — Next.js E-Commerce Frontend

This project is built with **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**.

It integrates with three Java Spring Boot microservices:
- **Product Service** (port 8082) — Product CRUD operations
- **Upload Service** (port 8081) — File upload with S3
- **Payment Service** (port 8080) — PayPal, Razorpay, PhonePe

## Project Architecture

```
Frontend (Next.js 3000)
  └─> Next.js Rewrites (CORS proxy)
      ├─> /api/products/* → Product Service (8082)
      ├─> /api/uploads/* → Upload Service (8081)
      └─> /api/v1/payments/* → Payment Service (8080)
```

## Project Structure

- `src/types/` — TypeScript interfaces matching backend DTOs
- `src/lib/api.ts` — API client with `productApi` and `uploadApi`
- `src/lib/products.ts` — Product management functions (async API calls)
- `src/context/CartContext.tsx` — Cart state management (React Context + useReducer)
- `src/components/` — Reusable UI components
  - `common/` — Shared components like MediaUploader
- `src/app/` — Next.js App Router pages
  - `/` — Home page with product listing
  - `/cart` — Shopping cart
  - `/checkout` — Payment flow
  - `/admin/products` — Admin dashboard

## Backend Integration

### Product API (Fully Integrated)

All pages use async API calls to backend:

```typescript
// Get all products
const products = await getAllProductsFromAPI();

// Get single product
const product = await getProductByIdFromAPI(id);

// Create product
const newProduct = await createProductViaAPI(productData);

// Update product
await updateProductViaAPI(id, updates);

// Delete product
await deleteProductViaAPI(id);
```

⚠️ **No mock/hardcoded products** — all data comes from backend or localStorage fallback.

### File Upload

```typescript
// Upload files
const files = await uploadApi.uploadFile(formData);

// Replace file
const file = await uploadApi.updateFile(fileId, formData);

// Delete file
await uploadApi.deleteFile(fileId);
```

## Environment Variables

Required in `.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_PRODUCT_URL` | Product service URL | `http://localhost:8082` |
| `NEXT_PUBLIC_UPLOAD_URL` | Upload service URL | `http://localhost:8081` |
| `NEXT_PUBLIC_PAYMENT_URL` | Payment service URL | `http://localhost:8080` |
| `NEXT_PUBLIC_USE_PRODUCT_API` | Use backend API (`"true"`) or localStorage (`"false"`) | `"true"` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Required for Razorpay |

## Design System

### Theme

Consistent gradient throughout the app:
```css
from-blue-600 via-purple-600 to-pink-600
```

### Focus States

```css
focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600
```

### Components

- **Navbar**: Logo + gradient text, cart badge
- **ProductCard**: Product display with images, stock status
- **ProductForm**: Bold labels with gradient bullets (●), red asterisks for required
- **MediaUploader**: Drag-drop with edit/delete buttons
- **CartItemRow**: Next.js Image optimized thumbnails

## Coding Conventions

### Pages

- All pages are client components (`"use client"`)
- Use async/await for data fetching
- Handle loading and error states

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadProducts = async () => {
    const data = await getAllProductsFromAPI();
    setProducts(data);
    setIsLoading(false);
  };
  loadProducts();
}, []);
```

### API Calls

- Always use the API functions from `src/lib/products.ts` or `src/lib/api.ts`
- Never call backend URLs directly
- Use `/api/products` paths (proxied by Next.js)

```typescript
// ✅ Good
const products = await getAllProductsFromAPI();

// ❌ Bad
const response = await fetch('http://localhost:8082/api/products');
```

### Styling

- Use Tailwind CSS utility classes only
- Follow the gradient theme for primary actions
- Maintain responsive design (mobile-first)
- Use consistent spacing (4, 6, 8, 12, 16)

### TypeScript

- Always define types for props and state
- Use interfaces from `src/types/`
- Avoid `any` type
- Use type inference where appropriate

## Type Definitions

### Product

```typescript
interface Product {
  id: string;           // UUID from backend
  name: string;
  description: string;
  price: number;
  image: string;        // S3 URL
  category: string;
  stock: number;
  gallery?: string[];   // Optional array of S3 URLs
}
```

### Cart Context

```typescript
const { 
  cart,           // CartItem[]
  totalItems,     // number
  totalPrice,     // number
  addToCart,      // (product: Product) => void
  removeFromCart, // (productId: string) => void
  updateQuantity, // (productId: string, quantity: number) => void
  clearCart       // () => void
} = useCart();
```

## Development Workflow

1. **Start backend services** (3 separate terminals)
2. **Start Next.js dev server**: `npm run dev`
3. **Make changes** in feature branch
4. **Test manually** with backend running
5. **Check DevTools** Network tab for API calls
6. **Commit** with conventional commit messages

## Common Tasks

### Adding a New Product Feature

1. Update types in `src/types/order.ts`
2. Update backend ProductController (if needed)
3. Update `src/lib/api.ts` API client
4. Update `src/lib/products.ts` functions
5. Update UI components to use new fields

### Debugging API Issues

1. Check browser console for errors
2. Verify backend is running (netstat/lsof)
3. Check Network tab for failed requests
4. Verify environment variables loaded
5. Check Next.js rewrite config

## Documentation

- **README.md** — Setup and getting started
- **BACKEND_INTEGRATION.md** — Backend integration details
- **API.md** — Complete API reference
- **CONTRIBUTING.md** — Contribution guidelines
- **CHANGELOG.md** — Version history

## Important Notes

- **No default products**: App starts with empty product list
- **Backend required**: Must run product service for data
- **Async everywhere**: All product operations are async
- **Type-safe**: Full TypeScript coverage
- **CORS-free**: Next.js rewrites handle proxying

