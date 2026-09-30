# 🍯 Madhuvan Honey - Backend API

Robust, scalable, and secure RESTful e-commerce API for **Madhuvan Honey**, built with **TypeScript**, **Express 5**, and **MongoDB / Mongoose**.

---

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Sample Request Payloads](#-sample-request-payloads)
- [Standard API Response Format](#-standard-api-response-format)

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript 7.0+
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Environment Management**: dotenv
- **CORS**: cors middleware

---

## 🗂 Project Architecture

```
honey-backend/
│
├── src/
│   │
│   ├── config/
│   │   └── database.ts             # MongoDB Mongoose connection
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts       # Register, login, profile handlers
│   │   ├── product.controller.ts    # Product catalog handlers
│   │   ├── order.controller.ts      # Checkout, order processing handlers
│   │   ├── customer.controller.ts   # Admin customer management & stats
│   │   └── category.controller.ts   # Category management handlers
│   │
│   ├── models/
│   │   ├── User.ts                  # Customer & Admin user schema
│   │   ├── Product.ts               # Honey product schema
│   │   ├── Order.ts                 # Order & shipping schema
│   │   └── Category.ts              # Product category schema
│   │
│   ├── routes/
│   │   ├── auth.routes.ts           # /api/auth endpoints
│   │   ├── product.routes.ts        # /api/products endpoints
│   │   ├── order.routes.ts          # /api/orders endpoints
│   │   ├── customer.routes.ts       # /api/customers endpoints
│   │   └── category.routes.ts       # /api/categories endpoints
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT Bearer token verification
│   │   ├── admin.middleware.ts      # Admin role validation
│   │   └── error.middleware.ts      # Global error and 404 handler
│   │
│   ├── services/
│   │   ├── auth.service.ts          # Authentication business logic
│   │   ├── product.service.ts       # Catalog filtering & stock logic
│   │   ├── order.service.ts         # Order computation & inventory logic
│   │   └── payment.service.ts       # Payment processing & refund logic
│   │
│   ├── utils/
│   │   ├── generateToken.ts         # JWT sign & verify utilities
│   │   └── response.ts              # Standardized API response formatters
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces and types
│   │
│   ├── app.ts                       # Express application bootstrap
│   └── server.ts                    # Server listener & database initiator
│
├── .env                             # Environment configuration (gitignored)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore configuration
├── package.json                     # NPM dependencies and scripts
├── tsconfig.json                    # TypeScript compiler configuration
└── README.md                        # Documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/madhuvan_honey

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Starts the server with `nodemon` and `ts-node` for live reload:
```bash
npm run dev
```

### 3. Build for Production
Compiles TypeScript into JavaScript inside the `dist/` directory:
```bash
npm run build
```

### 4. Run Production Server
```bash
npm start
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the development server with live reload via nodemon and ts-node |
| `npm run build` | Compiles TypeScript files to `dist/` |
| `npm start` | Runs the compiled production code from `dist/server.js` |

---

## 📡 API Endpoints Overview

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile / change password |

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Fetch all active categories |
| `GET` | `/api/categories/:id` | Public | Fetch category details by ID |
| `POST` | `/api/categories` | Admin | Create a new category |
| `PUT` | `/api/categories/:id` | Admin | Update category details |
| `DELETE` | `/api/categories/:id` | Admin | Delete a category |

### 🍯 Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (Supports search, filter, pagination, sorting) |
| `GET` | `/api/products/slug/:slug` | Public | Fetch product by URL slug |
| `GET` | `/api/products/:id` | Public | Fetch product by ID |
| `POST` | `/api/products` | Admin | Create a new honey product |
| `PUT` | `/api/products/:id` | Admin | Update existing product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |

**Query parameters supported on `GET /api/products`**:
- `search`: Keyword search on product name, description, and origin
- `category`: Filter by Category ObjectId
- `honeyType`: Filter by `raw`, `organic`, `wild_forest`, `multifloral`, `monofloral`, `infused`, `comb`
- `minPrice` / `maxPrice`: Filter by price range
- `isFeatured`: `true` or `false`
- `inStock`: `true` or `false`
- `page` & `limit`: Pagination controls (default: page 1, limit 12)
- `sort`: Sorting field (e.g. `-createdAt`, `price`, `-price`, `rating`)

### 🛒 Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Authenticated | Create and place an order (auto stock deduction) |
| `GET` | `/api/orders/my-orders` | Authenticated | Get orders for logged-in user |
| `GET` | `/api/orders/:id` | Authenticated | Get order details by ID (owner or admin) |
| `POST` | `/api/orders/:id/payment`| Authenticated | Process payment for order |
| `POST` | `/api/orders/:id/cancel` | Authenticated | Cancel order (auto stock restoration) |
| `GET` | `/api/orders` | Admin | Get all platform orders |
| `PATCH` | `/api/orders/:id/status`| Admin | Update order status (`processing`, `shipped`, `delivered`, `cancelled`) |

### 👥 Customer Management (`/api/customers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customers/stats` | Admin | Customer analytics (total, active, new this month) |
| `GET` | `/api/customers` | Admin | List customers with search, active status filter, pagination |
| `GET` | `/api/customers/:id` | Admin | Get customer details with order history |
| `PATCH` | `/api/customers/:id/status` | Admin | Activate or deactivate customer account |

---

## 📦 Sample Request Payloads

### 1. Register User (`POST /api/auth/register`)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "phone": "+91 9876543210"
}
```

### 2. Create Product (`POST /api/products`)
```json
{
  "name": "Wild Himalayan Raw Honey",
  "description": "100% pure unpasteurized wild multi-floral honey sourced from Himalayan forests.",
  "category": "651a2b3c4d5e6f7a8b9c0d1e",
  "price": 650,
  "discountPrice": 599,
  "stockQuantity": 45,
  "weight": "500g",
  "honeyType": "wild_forest",
  "origin": "Himalayan Foothills, Uttarakhand",
  "images": ["https://example.com/himalayan-honey.jpg"],
  "isFeatured": true
}
```

### 3. Place Order (`POST /api/orders`)
```json
{
  "orderItems": [
    {
      "product": "651a2b3c4d5e6f7a8b9c0d1e",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "phone": "+91 9876543210",
    "addressLine1": "Flat 402, Green Meadows",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India"
  },
  "paymentMethod": "upi",
  "notes": "Please deliver during business hours"
}
```

---

## 📐 Standard API Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Detailed error message",
  "error": "..." // Stack trace included only in development mode
}
```
