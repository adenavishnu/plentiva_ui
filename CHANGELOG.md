# Changelog

All notable changes to the Plentiva UI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-14

### 🚀 Major Release: Full Backend Integration

This release marks the complete migration from mock data to backend API integration.

### Added

- **Backend API Integration**
  - Added complete API client in `src/lib/api.ts`
  - `productApi` with CRUD operations (GET, POST, PATCH, DELETE)
  - `uploadApi` with file management (upload, update, delete)
  - Type-safe API functions with automatic JSON handling

- **Async Product Functions**
  - `getAllProductsFromAPI()` - Fetch all products from backend
  - `getProductByIdFromAPI(id)` - Fetch single product
  - `createProductViaAPI(product)` - Create new product
  - `updateProductViaAPI(id, updates)` - Update product
  - `deleteProductViaAPI(id)` - Delete product

- **Next.js API Proxying**
  - Three rewrite rules in `next.config.ts`
  - `/api/products/*` → `http://localhost:8082`
  - `/api/uploads/*` → `http://localhost:8081`
  - `/api/v1/payments/*` → `http://localhost:8080`
  - Eliminates CORS issues

- **Environment Configuration**
  - `NEXT_PUBLIC_PRODUCT_URL` for product service URL
  - `NEXT_PUBLIC_UPLOAD_URL` for upload service URL
  - `NEXT_PUBLIC_PAYMENT_URL` for payment service URL
  - `NEXT_PUBLIC_USE_PRODUCT_API` feature flag

- **Documentation**
  - Comprehensive README.md with setup instructions
  - BACKEND_INTEGRATION.md with migration guide
  - API.md with complete API reference
  - CHANGELOG.md (this file)

- **File Management Enhancement**
  - `uploadApi.updateFile()` for replacing files
  - Edit button on all uploaded files (single and multiple modes)
  - ID-based file replacement in MediaUploader

### Changed

- **All Pages Now Async**
  - Home page (`/`) uses `getAllProductsFromAPI()`
  - Admin products page (`/admin/products`) uses async API calls
  - Create page (`/admin/products/create`) uses `createProductViaAPI()`
  - Edit page (`/admin/products/edit/[id]`) uses async API calls

- **Product Management**
  - All CRUD operations now call backend API
  - Stock updates via `updateProductViaAPI()`
  - Product deletion via `deleteProductViaAPI()`
  - No localStorage operations in API mode

- **UI Improvements**
  - ProductForm labels now bold with gradient bullets (●)
  - Red asterisks for required fields
  - Consistent gradient theme across all buttons and focus states
  - Cart thumbnails use Next.js Image optimization

- **Navbar Enhancement**
  - Plentiva logo integration
  - Gradient text styling for brand name
  - Active link highlighting with gradient
  - Cart badge with gradient background

### Removed

- **Complete Mock Data Removal**
  - Deleted `defaultProducts` array (removed 6 hardcoded products)
  - Removed all "prod-0" ID prefix checks
  - Removed default product restrictions in all functions
  - Deleted default product protection logic from admin UI
  - `getAllProducts()` now returns empty array on server-side

- **Default Product Restrictions**
  - Removed `isDefault` flag from admin products page
  - Removed "Cannot delete default products" alerts
  - Removed "Cannot update stock for default products" checks
  - Removed "Cannot edit default products" restriction from edit page
  - All products now treated equally

- **Hardcoded Products**
  - Wireless Headphones ($249.99)
  - Mechanical Keyboard ($129.99)
  - Ultra-Wide Monitor ($599.99)
  - Ergonomic Chair ($349.99)
  - Smart Watch ($199.99)
  - Bluetooth Speaker ($79.99)

### Fixed

- **API Rewrite Bug**
  - Fixed broken rewrite path: `/api/uploa:path*` → `/api/uploads/:path*`

- **Variable Naming**
  - Fixed inconsistent variable name in `handleDelete()` (was using `id` instead of `productId`)

### Breaking Changes

⚠️ **Backend Services Now Required**

The application now requires backend services to be running:
- Product service on port 8082
- Upload service on port 8081 (for file management)
- Payment service on port 8080 (for checkout)

Without backend services running, the application will:
- Show empty product list on home page
- Display errors in browser console
- Not persist any product data

**Migration Path:**
1. Set `NEXT_PUBLIC_USE_PRODUCT_API="false"` to use localStorage mode (no backend required)
2. Products will be stored in browser localStorage only
3. No default products will be available

### Technical Details

**Type Mapping:**
- Frontend Product ID: `string`
- Backend Product ID: `UUID` (converted to string)
- All async functions return `Promise<T>`

**Data Flow:**
```
Component → API Function → fetch() → Next.js Proxy → Backend Service
    ↓
State Update ← JSON Parse ← HTTP Response ← Database Query
```

**Backward Compatibility:**
- LocalStorage mode still available via feature flag
- All old localStorage functions remain functional
- Can switch between modes with environment variable

---

## [1.0.0] - 2026-02-10

### Initial Release

- Next.js 15 with App Router
- TypeScript + Tailwind CSS
- Shopping cart with Context API
- Payment gateway integration (PayPal, Razorpay, PhonePe)
- Admin dashboard with product management
- LocalStorage-based product management
- Material-UI icons
- Responsive design

---

## Future Roadmap

### Planned for v2.1.0
- [ ] Error boundary components
- [ ] Loading skeleton screens
- [ ] Retry logic for failed API calls
- [ ] Optimistic UI updates
- [ ] Image optimization for gallery

### Planned for v3.0.0
- [ ] User authentication (JWT/OAuth2)
- [ ] User profiles and wishlists
- [ ] Product reviews and ratings
- [ ] Advanced search and filtering
- [ ] Real-time stock updates (WebSocket)
- [ ] Email notifications
- [ ] Multi-language support (i18n)

---

## Version History

- **2.0.0** (2026-02-14) - Full backend integration, removed mock data
- **1.0.0** (2026-02-10) - Initial release with localStorage

---

**Maintained by:** Plentiva Development Team  
**License:** Proprietary  
**Repository:** [github.com/adenavishnu/plentiva_ui](https://github.com/adenavishnu/plentiva_ui)
