# 🍯 Madhuvan Honey - Full E-Commerce Backend API

Enterprise-grade, secure, and type-safe RESTful API for **Madhuvan Honey** built with **TypeScript**, **Express 5**, and **MongoDB / Mongoose**. Designed to fully integrate with the `madhuvan_honey` frontend application for customer shopping, live consignment tracking, video reel streams, and complete beekeeper administrative management.

---

## 📋 Table of Contents
- [Features & Capabilities](#-features--capabilities)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [API Endpoints Overview](#-api-endpoints-overview)
  - [Customer & Public APIs](#1-customer--storefront-apis)
  - [Administrative APIs](#2-beekeeper-executive-admin-apis)
- [Environment Variables](#-environment-variables)
- [Getting Started & Database Seeding](#-getting-started--database-seeding)
- [Available Scripts](#-available-scripts)
- [Standard API Response Format](#-standard-api-response-format)

---

## 🌟 Features & Capabilities

- **Customer Storefront Experience**:
  - Full product catalog with filters for category, honey type, harvest season, price range, and purity score.
  - Slug-based product routing (`/api/v1/products/slug/:slug`).
  - Size variants (e.g. 250g, 500g, 1kg) with dynamic price calculation and inventory deduction.
  - Interactive customer product reviews with verified buyer badges.
  - Customer wishlist saving and toggling.
  - Live package tracking radar via order number, courier AWB code, or phone number.
  - Honey Journey & Apiary video reel streaming with live view count tracking.
  - Contact inquiry submissions and newsletter subscriptions.
- **Administrative Portal (`/admin`)**:
  - Executive Apiary Dashboard with real-time gross revenue, jar counts, active SKUs, patron counts, and 6-month sales trend graphs.
  - Product Catalog CRUD with multi-size SKU support, harvest story, benefits, and nutritional breakdown.
  - Category Management with real-time product count synchronization.
  - Order Fulfillment Management: update status (pending, processing, shipped, delivered, cancelled) and assign courier tracking codes.
  - Customer CRM: patron directory with lifetime orders, gross spend, last order date, and account status toggling.
  - Video Reels Manager: upload and edit apiary harvest clips and attach tagged honey products.
  - Store Settings: configure free shipping thresholds, standard delivery fees, GST rates, and apiary headquarters contact details.
- **Dual API Prefix Compatibility**:
  - All routes are accessible via both `/api/*` and `/api/v1/*` to ensure seamless compatibility with Vite/React frontend environment variables (`VITE_API_BASE_URL`).

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript 7.0+
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose 9+ ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Environment Management**: dotenv
- **CORS**: cors middleware (configured for local and production frontends)

---

## 🗂 Project Architecture

```
madhuvan_honey-backend/
├── src/
│   ├── config/
│   │   └── database.ts              # MongoDB Mongoose connection
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts        # Customer & admin auth, profiles, password changes
│   │   ├── product.controller.ts     # Products, size options, slugs, related items, reviews
│   │   ├── category.controller.ts    # Categories with live product count
│   │   ├── order.controller.ts       # Cart checkout, customer orders, consignment tracking radar
│   │   ├── customer.controller.ts    # Customer patron directory and aggregate order statistics
│   │   ├── video.controller.ts       # Honey Journey video reels and view counter
│   │   ├── dashboard.controller.ts   # Executive dashboard analytics and 6-month sales trends
│   │   ├── settings.controller.ts    # Store parameters, shipping rates, and contact info
│   │   ├── contact.controller.ts     # Contact inquiries and newsletter subscriptions
│   │   ├── wishlist.controller.ts    # Customer saved harvest items
│   │   └── payment.controller.ts     # Payment processing and gateway simulation
│   │
│   ├── models/
│   │   ├── User.ts                   # Customer & Admin user schema with wishlist & addresses
│   │   ├── Product.ts                # Rich honey product schema (sizes, benefits, nutrition, reviews)
│   │   ├── Category.ts               # Product categories schema
│   │   ├── Order.ts                  # Orders, tracking codes, couriers, and fulfillment
│   │   ├── Video.ts                  # Apiary video stories and reels
│   │   ├── Settings.ts               # Store configuration & shipping rates
│   │   ├── ContactInquiry.ts         # Contact form inquiries
│   │   └── Newsletter.ts             # Newsletter subscribers
│   │
│   ├── routes/
│   │   ├── auth.routes.ts            # /api/v1/auth
│   │   ├── product.routes.ts         # /api/v1/products
│   │   ├── category.routes.ts        # /api/v1/categories
│   │   ├── order.routes.ts           # /api/v1/orders
│   │   ├── customer.routes.ts        # /api/v1/customers
│   │   ├── video.routes.ts           # /api/v1/videos
│   │   ├── wishlist.routes.ts        # /api/v1/wishlist
│   │   ├── payment.routes.ts         # /api/v1/payment
│   │   ├── settings.routes.ts        # /api/v1/settings
│   │   ├── contact.routes.ts         # /api/v1/contact & newsletter
│   │   ├── dashboard.routes.ts       # /api/v1/dashboard
│   │   └── admin.routes.ts           # /api/v1/admin (Unified admin gateway)
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT verification
│   │   ├── admin.middleware.ts       # Admin privilege authorization
│   │   └── error.middleware.ts       # Global error handling and 404
│   │
│   ├── services/                     # Business logic and database operations
│   ├── scripts/
│   │   └── seed.ts                   # Complete database seeder
│   ├── types/
│   │   └── index.ts                  # TypeScript definitions matching madhuvan_honey
│   ├── utils/
│   ├── app.ts                        # Application route registration
│   └── server.ts                     # HTTP listener & process handlers
│
├── .env                              # Environment configuration
├── package.json
└── tsconfig.json
```

---

## 📡 API Endpoints Overview

All endpoints are available under both `/api/*` and `/api/v1/*`.

### 1. Customer & Storefront APIs

#### Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Register new customer account | No |
| `POST` | `/login` | Customer / Admin email login | No |
| `POST` | `/admin/login` | Dedicated admin login with role verification | No |
| `GET` | `/me` | Get logged-in user profile with wishlist | Yes |
| `PUT` | `/profile` | Update profile information and address | Yes |
| `PUT` | `/change-password` | Change user password | Yes |

#### Honey Products (`/api/v1/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | List all honey products (supports search, category, price, isFeatured, sort, page) | No |
| `GET` | `/slug/:slug` | Get product details by SEO slug (e.g. `sundarbans-wild-forest-honey`) | No |
| `GET` | `/:id` | Get product by MongoDB ID | No |
| `GET` | `/:id/related` | Get related products in the same category | No |
| `POST` | `/:id/reviews` | Submit a customer rating and review | Optional |

#### Categories (`/api/v1/categories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get all categories with dynamic product count | No |
| `GET` | `/slug/:slug` | Get single category by slug | No |
| `GET` | `/:id` | Get single category by ID | No |

#### Orders & Consignment Radar (`/api/v1/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Place order (guest or authenticated customer) | Optional |
| `GET` | `/my-orders` | Get orders for logged-in customer | Yes |
| `GET` | `/track/:query` | **Live Dispatch Radar**: track by `orderNumber` (e.g. `MDH-8821`), `trackingNumber`, or `customerPhone` | No |
| `GET` | `/:id` | Get full order details | Optional |
| `PUT` | `/:id/cancel` | Cancel an order before fulfillment | Optional |
| `POST` | `/:id/pay` | Complete payment for an order | Optional |

#### Honey Journey Videos (`/api/v1/videos`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get video reels (filter by category: harvest, purity, recipe, story; featured) | No |
| `GET` | `/:id` | Get video reel details | No |
| `POST` | `/:id/view` | Increment video reel view counter | No |

#### Customer Wishlist (`/api/v1/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Get customer saved harvest products | Yes |
| `POST` | `/:productId` | Toggle save / remove from wishlist | Yes |

#### Payments & Checkout (`/api/v1/payment`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/process` | Process or simulate payment (UPI, Card, NetBanking, COD, Razorpay) | No |
| `POST` | `/verify` | Verify payment transaction ID | No |

#### Store Settings & Inquiries (`/api/v1/settings`, `/api/v1/contact`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/settings` | Get public store settings, shipping thresholds, and contacts | No |
| `POST` | `/contact` | Submit inquiry form message | No |
| `POST` | `/newsletter` | Subscribe email to apiary newsletter | No |

---

### 2. Beekeeper Executive Admin APIs

All admin routes require a valid Bearer JWT belonging to a user with `role: 'admin'`.

#### Executive Dashboard (`/api/v1/admin/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Gross honey sales, total jars dispatched, active SKUs, patrons, 6-month sales trend, recent orders, and top products |

#### Catalog Management (`/api/v1/admin/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List all products with admin controls |
| `POST` | `/products` | List new honey harvest (supports multiple size options, story, benefits, nutrition facts) |
| `PUT` | `/products/:id` | Update product attributes, pricing, or stock |
| `DELETE` | `/products/:id` | Remove honey product from inventory |

#### Category Management (`/api/v1/admin/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/categories` | Create new honey category |
| `PUT` | `/categories/:id` | Update category details or image |
| `DELETE` | `/categories/:id` | Remove category |

#### Order Fulfillment (`/api/v1/admin/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | View all customer orders (filters for status, payment, search) |
| `GET` | `/orders/:id` | View detailed invoice and fulfillment info |
| `PUT` | `/orders/:id/status` | Update fulfillment state (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `PUT` | `/orders/:id/tracking` | Assign courier AWB code and carrier name (e.g. Delhivery, BlueDart) |
| `PUT` | `/orders/:id/cancel` | Cancel order and automatically restore stock |

#### Customer Directory & CRM (`/api/v1/admin/customers`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | Patron table with lifetime orders, total spent, last order date, and city |
| `GET` | `/customers/stats` | Customer metrics (total patrons, active, new this month) |
| `GET` | `/customers/:id` | View patron profile and order history |
| `PUT` | `/customers/:id/status` | Activate or deactivate customer account |

#### Video Reel Studio (`/api/v1/admin/videos`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/videos` | Publish new apiary harvest reel, embed URL, and tag honey products |
| `PUT` | `/videos/:id` | Update video title, description, or tag |
| `DELETE` | `/videos/:id` | Remove video from public library |

#### Store Configuration & CRM (`/api/v1/admin/settings`, `/api/v1/admin/inquiries`)
| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/settings` | Update store name, free shipping threshold (₹), standard fee (₹), address, and contacts |
| `GET` | `/inquiries` | View all customer messages and inquiries |
| `PUT` | `/inquiries/:id` | Update message status (`unread`, `read`, `replied`) |
| `GET` | `/subscribers` | View email newsletter subscribers list |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/madhuvan_honey

# Authentication / Security
JWT_SECRET=madhuvan_secret_jwt_key_9837498234_honey_production_key
JWT_EXPIRES_IN=7d

# Client CORS (Allows Vite React frontend)
CLIENT_URL=http://localhost:5173
```

---

## 🌱 Getting Started & Database Seeding

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Pre-Configured Store Data
Populate the database with all default products, categories, video stories, default administrator, and test patrons:
```bash
npm run seed
```

**Default Credentials Created by Seeder:**
- **Admin Portal**:
  - Email: `admin@madhuvanhoney.com`
  - Password: `adminhoney123`
- **Sample Customer**:
  - Email: `aarav.patel@example.com`
  - Password: `customer123`

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📦 Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon --watch src --ext ts --exec ts-node src/server.ts` | Start dev server with hot reload |
| `npm run build` | `tsc` | Compile TypeScript into `dist/` |
| `npm start` | `node dist/server.js` | Run compiled production build |
| `npm run seed` | `ts-node src/scripts/seed.ts` | Reset and seed complete mock apiary data |

---

## 📊 Standard API Response Format

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": { ... }
}
```

```json
{
  "success": false,
  "message": "Product with slug 'xyz' not found"
}
```
