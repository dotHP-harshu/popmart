<div align="center">
  <img src="./client/public/logo.png" alt="PopMart Logo" width="400" />
</div>

# PopMart

> **Multi-Vendor Mini Marketplace** — A MERN stack platform where buyers shop, sellers manage inventory, and admins oversee the ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-green)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-green)](https://mongoosejs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

---

## What is PopMart?

PopMart is a multi-vendor marketplace built to demonstrate three critical backend concepts: **role-based access control**, a **strict order state machine**, and **concurrent-safe inventory management**.

- **Buyers** browse products, manage a cart, and place orders.
- **Sellers** list products, manage stock, and fulfill orders.
- **Admins** approve seller applications and monitor platform activity.

---

## Key Features

**Role-Based Access Control**
- Three user roles: Admin, Seller, Buyer — each with scoped permissions.
- Sellers require admin approval before they can list products (`isApproved` flag).
- JWT-based authentication with bcrypt password hashing.

**Order State Machine with Strict Transitions**
```
pending  →  approved  →  shipped  →  delivered
pending  →  cancelled
approved →  cancelled
```
- Invalid transitions are rejected at the controller level.
- Cancellation restores inventory via MongoDB `$inc`.

**Atomic Inventory Deduction**
- Stock is deducted at order creation using MongoDB's `$inc` operator.
- On cancellation, stock is restored with the same atomic operation — no race conditions.
- `priceAtPurchase` stored on each order item so price changes never break historical orders.

**Seller-First Product Scoping**
- Products are always scoped to `sellerId` — sellers only see and manage their own listings.
- Buyers browse a curated catalog from approved sellers only.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                        │
│  (React Router, Zustand, Tailwind CSS, TypeScript)               │
└────────────────┬─────────────────────────────────────────────────┘
                 │  fetch() / JSON
    ┌────────────┴────────────┐
    │                         │
    ▼                        ▼
┌──────────────────┐  ┌──────────────────────┐
│   Auth Routes    │  │  Role-Based Routes   │
│  /api/auth/*     │  │  /api/admin/*        │
│                  │  │  /api/seller/*       │
│                  │  │  /api/buyer/*        │
└──────────────────┘  └──────────┬───────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌──────────────────┐  ┌──────────────────────┐
          │  Auth Middleware │  │  Controllers         │
          │  (JWT verify)    │  │  (route handlers)    │
          └──────────────────┘  └──────────┬───────────┘
                    ┌──────────────────────┴───────────┐
                    │                                  │
                    ▼                                  ▼
          ┌──────────────────┐  ┌──────────────────────────┐
          │   Models         │  │  Services / Utils        │
          │   (Mongoose)     │  │  (state machine, etc.)   │
          └────────┬─────────┘  └──────────────────────────┘
                   │
                   ▼
          ┌──────────────────┐
          │     MongoDB      │
          │  (Atlas / Local) │
          └──────────────────┘
```

---

## Project Structure

```
popmart/
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── components/            # Reusable UI (Skeleton, Toast)
│   │   ├── pages/                 # Storefront, Cart, SellerDashboard, AdminPanel, etc.
│   │   ├── store/                 # Zustand stores (auth, cart)
│   │   ├── services/              # API client (api.ts)
│   │   ├── App.tsx                # Role-based routing
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Tailwind base styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                        # Express API
│   ├── src/
│   │   ├── config/                # DB connection, Cloudinary setup
│   │   ├── models/                # Mongoose schemas (User, Product, Order)
│   │   ├── routes/                # Grouped by role (auth, admin, seller, buyer)
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # JWT auth, role guards
│   │   └── index.ts               # Express app entry
│   ├── seed/                      # Seed data scripts
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── package.json                   # Root scripts (concurrently)
└── README.md
```

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework |
| Vite | 6 | Build tool & dev server |
| TypeScript | 5.7 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| Zustand | 5 | Lightweight state management |
| React Router | 7 | Client-side routing |

### Backend

| Library | Version | Purpose |
|---------|---------|---------|
| Node.js | LTS | Runtime |
| Express | 4.21 | Web framework |
| TypeScript | 5.7 | Type safety |
| Mongoose | 8 | MongoDB ODM |
| bcrypt | 5 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| multer | 2 | File uploads |
| Cloudinary | 2 | Image hosting |

### Infrastructure

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database |
| Cloudinary | Product image storage |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd popmart

# Install root dependencies (concurrently)
npm install
```

#### Backend Setup

```bash
cd server

npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/popmart
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
```

```bash
# Start the server (tsx watch mode)
npm run dev
```

#### Frontend Setup

```bash
cd client

npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000
```

```bash
# Start the dev server
npm run dev
```

### Seed Data (Optional)

```bash
cd server
npm run seed:generate
```

Then import the generated JSON files into your MongoDB collection.

### Run Both Simultaneously

```bash
# From project root
npm run dev
```

This uses `concurrently` to run both server and client in watch mode.

---

## API Endpoints

All endpoints return JSON: `{ success: true, data: ... }` or `{ success: false, error: "..." }`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (default role: buyer) |
| POST | `/api/auth/login` | Login, returns JWT |

### Admin Routes (requires `admin` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pending-sellers` | List sellers awaiting approval |
| PUT | `/api/admin/sellers/:id/approve` | Approve a seller account |

### Seller Routes (requires `seller` role + `isApproved: true`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/products` | List seller's own products |
| POST | `/api/seller/products` | Add a new product |
| GET | `/api/seller/orders` | Orders containing seller's products |
| PUT | `/api/seller/orders/:id/status` | Update order status (state machine) |

### Buyer Routes (requires `buyer` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buyer/products` | Browse all available products |
| POST | `/api/buyer/orders` | Create order (deducts inventory) |
| GET | `/api/buyer/orders` | View order history |

---

## Data Models

### User

```
fullName:      string
email:         string (unique)
passwordHash:  string
role:          'admin' | 'seller' | 'buyer'
isApproved:    boolean (default: false)
timestamps:    true
```

### Product

```
sellerId:      ObjectId (ref: User)
productName:   string
description:   string
price:         number (min: 0)
stockQuantity: number (min: 0)
timestamps:    true
```

### Order

```
buyerId:       ObjectId (ref: User)
orderItems:    [{ productId, quantity, priceAtPurchase }]
totalAmount:   number
orderStatus:   'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
timestamps:    true
```

---

## How It Works

### Buyer Flow

1. Register as a buyer and log in.
2. Browse the storefront — products from all approved sellers.
3. Add items to cart (managed via Zustand store).
4. Checkout — the system checks stock, creates the order, and atomically deducts inventory.
5. Track order status from the orders page.

### Seller Flow

1. Register with role `seller`. Account starts as `isApproved: false`.
2. Wait for admin approval. Cannot list products until approved.
3. Once approved, add products with name, description, price, stock, and images.
4. View incoming orders for your products.
5. Update order status following the state machine: `pending → approved → shipped → delivered`.

### Admin Flow

1. Log in with an admin account.
2. View all pending seller applications.
3. Approve or reject sellers.
4. Monitor platform activity.

---

## Order State Machine

```
                                                ┌──────────┐
                                                │  pending │
                                                └────┬─────┘
                                                    │
                                      ┌──────────────┼──────────────┐
                                      │              │              │
                                      ▼              ▼              ▼
                                ┌──────────┐  ┌──────────┐   ┌──────────┐
                                │ approved │  │cancelled │   │(invalid) │
                                └────┬─────┘  └──────────┘   └──────────┘
                                     │
                        ┌────────────┼─────────────┐
                        │            │             │
                        ▼           ▼             ▼
                      ┌────────┐ ┌─────────┐ ┌──────────┐
                      │ shipped│ │cancelled│ │(invalid) │
                      └───┬────┘ └─────────┘ └──────────┘
                          │
                          ▼
                      ┌───────────┐
                      │ delivered │
                      └───────────┘
```

Valid transitions are enforced by a plain JS object map — no state machine library.

---

## Key Business Logic Details

**Inventory Deduction**
- Uses Mongoose `findOneAndUpdate` with `$inc` to atomically decrement stock.
- If stock is insufficient, the order creation is rejected.
- On cancellation, `$inc` restores the deducted quantity.

**Price at Purchase**
- Order items store `priceAtPurchase` — the product's current price at checkout time.
- Future price changes never affect completed orders.

**Seller Approval Gate**
- The `isApproved` flag on the User model prevents unapproved sellers from accessing product CRUD routes.
- Middleware checks both role and approval status.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes with clear messages.
4. Push: `git push origin feature/your-feature`.
5. Open a Pull Request.

---

## License

 [![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE) 
---

<div align="center">

Built with ❤️ by [dotHP-harshu](https://github.com/dotHP-harshu)

</div>
