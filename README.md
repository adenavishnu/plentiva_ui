# Plentiva - E-Commerce Payment Platform

A modern e-commerce frontend built with Next.js 15, TypeScript, and Tailwind CSS, featuring integrated payment gateways (PayPal, Razorpay, PhonePe) and seamless backend API integration.

## 🚀 Features

- **Product Management**: Full CRUD operations with backend API integration
- **Shopping Cart**: Context-based cart management with persistent storage
- **Multiple Payment Gateways**: PayPal, Razorpay, and PhonePe support
- **File Upload**: S3-integrated file management for product images
- **Admin Dashboard**: Product analytics, stock management, and order tracking
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Type-Safe**: Full TypeScript support throughout

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Java Spring Boot backend services:
  - **Product Service** (port 8082) - Product CRUD operations
  - **Upload Service** (port 8081) - File upload/S3 integration
  - **Payment Service** (port 8080) - Payment processing

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adenavishnu/plentiva_ui.git
   cd plentiva_ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Backend Service URLs
   NEXT_PUBLIC_PRODUCT_URL="http://localhost:8082"
   NEXT_PUBLIC_UPLOAD_URL="http://localhost:8081"
   NEXT_PUBLIC_PAYMENT_URL="http://localhost:8080"
   
   # Feature Flags
   NEXT_PUBLIC_USE_PRODUCT_API="true"
   
   # Razorpay (client-side key)
   NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
   ```

4. **Start backend services** (in separate terminals)
   ```bash
   # Product Service (port 8082)
   cd path/to/product-service
   ./mvnw spring-boot:run
   
   # Upload Service (port 8081)
   cd path/to/upload-service
   ./mvnw spring-boot:run
   
   # Payment Service (port 8080)
   cd path/to/payment-service
   ./mvnw spring-boot:run
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js Frontend (3000)                │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │ Components│  │ Context  │              │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘              │
│       │              │             │                     │
│       └──────────────┴─────────────┘                     │
│                      │                                   │
│              ┌───────▼────────┐                          │
│              │   API Client   │                          │
│              │   (lib/api.ts) │                          │
│              └───────┬────────┘                          │
└──────────────────────┼───────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Product    │ │  Upload     │ │  Payment    │
│  Service    │ │  Service    │ │  Service    │
│  (8082)     │ │  (8081)     │ │  (8080)     │
└─────────────┘ └─────────────┘ └─────────────┘
```

### API Proxy Configuration

Next.js rewrites handle CORS by proxying requests to backend services:

```typescript
// next.config.ts
rewrites: [
  { source: '/api/products/:path*', destination: 'http://localhost:8082/api/products/:path*' },
  { source: '/api/uploads/:path*', destination: 'http://localhost:8081/api/uploads/:path*' },
  { source: '/api/v1/payments/:path*', destination: 'http://localhost:8080/api/v1/payments/:path*' }
]
```

## 📁 Project Structure

```
plentiva_ui/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page (product listing)
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── payment/           # Payment verification
│   │   ├── orders/            # Order history
│   │   └── admin/             # Admin dashboard
│   │       └── products/      # Product management
│   ├── components/            # Reusable UI components
│   │   ├── CartItemRow.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductForm.tsx
│   │   ├── PaymentProviderSelector.tsx
│   │   └── common/
│   │       └── MediaUploader.tsx
│   ├── context/               # React Context providers
│   │   └── CartContext.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts            # Backend API client
│   │   └── products.ts       # Product management functions
│   └── types/                # TypeScript type definitions
│       ├── index.ts
│       ├── order.ts
│       └── payment.ts
├── public/                    # Static assets
├── .env.local                # Environment variables (create this)
├── next.config.ts            # Next.js configuration
└── README.md                 # This file
```

## 🔌 API Integration

### Product API

All product operations now use the backend API when `NEXT_PUBLIC_USE_PRODUCT_API="true"`:

```typescript
import { 
  getAllProductsFromAPI, 
  getProductByIdFromAPI,
  createProductViaAPI,
  updateProductViaAPI,
  deleteProductViaAPI 
} from "@/lib/products";

// Fetch all products
const products = await getAllProductsFromAPI();

// Get single product
const product = await getProductByIdFromAPI(id);

// Create product
const newProduct = await createProductViaAPI({
  name: "Wireless Headphones",
  description: "Premium noise-cancelling",
  price: 299.99,
  image: "https://s3.../image.jpg",
  category: "Electronics",
  stock: 50,
  gallery: ["url1", "url2"]
});

// Update product
await updateProductViaAPI(id, { stock: 45 });

// Delete product
await deleteProductViaAPI(id);
```

### Backend Endpoints

#### Product Service (8082)
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PATCH /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

#### Upload Service (8081)
- `POST /api/uploads` - Upload file(s)
- `PUT /api/uploads/{id}` - Replace file
- `DELETE /api/uploads/{id}` - Delete file

#### Payment Service (8080)
- `POST /api/v1/payments/create-order` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments/orders/{userId}` - Get user orders

## 🎨 Design System

### Theme Colors

The application uses a consistent gradient theme throughout:

```css
/* Primary Gradient */
from-blue-600 via-purple-600 to-pink-600

/* Focus States */
purple-600 border and ring
```

### Components

- **Navbar**: Logo + gradient text, cart badge
- **ProductCard**: Product display with images, price, stock status
- **ProductForm**: Create/edit products with file upload
- **MediaUploader**: Drag-drop file upload with edit/delete
- **CartItemRow**: Cart items with thumbnails
- **StatusBadge**: Order/payment status indicators

## 🔧 Development Workflow

### Adding a New Product (via Admin UI)

1. Navigate to `/admin/products`
2. Click "Add New Product"
3. Fill in product details
4. Upload thumbnail and gallery images
5. Click "Create Product"

### Testing API Integration

1. Open browser DevTools (F12) → Network tab
2. Navigate to home page `/`
3. Verify API call to `/api/products`
4. Check response data

### Debugging

- **No API calls**: Ensure backend services are running on correct ports
- **CORS errors**: Check Next.js rewrites in `next.config.ts`
- **Empty product list**: Create products via admin panel or import data

## 📦 Build & Deploy

### Production Build

```bash
npm run build
npm start
```

### Environment Variables (Production)

Update `.env.local` or `.env.production` with production URLs:

```env
NEXT_PUBLIC_PRODUCT_URL="https://api.plentiva.com/products"
NEXT_PUBLIC_UPLOAD_URL="https://api.plentiva.com/uploads"
NEXT_PUBLIC_PAYMENT_URL="https://api.plentiva.com/payments"
```

## 🔐 Security Notes

- Payment keys (Razorpay secret, PayPal secret) should **only** be stored on the backend
- Frontend only uses public/client-side keys
- All payment verification happens server-side

## 📝 Additional Documentation

- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Detailed backend integration guide
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Project conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Plentiva e-commerce platform.

## 🆘 Troubleshooting

### Port 3000 already in use

```powershell
# Windows PowerShell
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($process) { Stop-Process -Id $process -Force }
```

### Backend connection refused

- Verify backend services are running: `netstat -ano | findstr :8082`
- Check environment variables in `.env.local`
- Ensure no firewall blocking localhost connections

### Images not loading

- Verify S3 URLs are accessible
- Check Next.js image configuration in `next.config.ts`
- Add S3 domain to `remotePatterns`

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
