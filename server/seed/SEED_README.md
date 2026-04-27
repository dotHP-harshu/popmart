# PopMart Seed Data

Fake data to make the marketplace look real. Import directly into MongoDB.

## What's Inside

| File | Documents | Description |
|------|-----------|-------------|
| `users.json` | 20 | 1 admin, 5 sellers (3 approved, 2 pending), 14 buyers |
| `products.json` | 50 | Pop Mart collectibles with images, categories, and stock |
| `orders.json` | 30 | 8 delivered, 8 shipped, 7 approved, 5 pending, 2 cancelled |

## Import Commands

Run the seed script from the server directory:

```bash
cd server
node seed/seed.js
```

Or import manually with mongoimport:

```bash
mongoimport --db popmart --collection users --jsonArray --drop --file server/seed/users.json
mongoimport --db popmart --collection products --jsonArray --drop --file server/seed/products.json
mongoimport --db popmart --collection orders --jsonArray --drop --file server/seed/orders.json
```

## Default Credentials

All users share the same password: **`password123`**

### Admin

| Name | Email | Role |
|------|-------|------|
| Priya Sharma | admin@popmart.in | admin |

### Sellers (Approved)

| Name | Email | Role | Products |
|------|-------|------|----------|
| Arjun Mehta | arjun@popmart.in | seller (approved) | 18 — Labubu, Molly |
| Neha Kapoor | neha@popmart.in | seller (approved) | 17 — Dimoo, Skullpanda |
| Rohan Verma | rohan@popmart.in | seller (approved) | 15 — Hirono, Cornpup, Panduck |

### Sellers (Pending Approval)

| Name | Email | Role |
|------|-------|------|
| Simran Patel | simran@popmart.in | seller (pending) |
| Vikram Singh | vikram@popmart.in | seller (pending) |

### Buyers (14)

| Name | Email | Status |
|------|-------|--------|
| Aisha Khan | aisha@popmart.in | active |
| Rahul Joshi | rahul@popmart.in | active |
| Pooja Nair | pooja@popmart.in | active |
| Amit Sharma | amit@popmart.in | **suspended** |
| Deepa Reddy | deepa@popmart.in | active |
| Karthik Menon | karthik@popmart.in | active |
| Sanjana Gupta | sanjana@popmart.in | active |
| Nikhil Bose | nikhil@popmart.in | active |
| Meghna Pillai | meghna@popmart.in | active |
| Aditya Kulkarni | aditya@popmart.in | active |
| Ritu Agarwal | ritu@popmart.in | active |
| Suresh Kumar | suresh@popmart.in | active |
| Nisha Choudhary | nisha@popmart.in | active |
| Varun Tiwari | varun@popmart.in | active |

## Product Categories

| Category | Count | Price Range |
|----------|-------|-------------|
| Blind Box | 26 | ₹399 – ₹999 |
| Accessories | 13 | ₹399 – ₹1,299 |
| Premium Figures | 7 | ₹1,499 – ₹3,999 |
| Plush | 5 | ₹1,899 – ₹3,499 |
| Display | 1 | ₹1,299 |

## Order Status Distribution

| Status | Count | Date Range |
|--------|-------|------------|
| delivered | 8 | Apr 12–15 |
| shipped | 8 | Apr 16–19 |
| approved | 7 | Apr 18–19 |
| pending | 5 | Apr 19 |
| cancelled | 2 | Apr 17–18 |

## v2 Fields

- **Users**: `isActive` field for admin suspension (Amit Sharma is suspended)
- **Products**: `images[]` (placeholder URLs), `category`, `isActive` fields
- **Products**: All products are `isActive: true` and visible to buyers

## Referential Integrity

All ObjectIds are consistent across files:
- `products.sellerId` → `users._id` (sellers only)
- `orders.buyerId` → `users._id` (buyers only)
- `orders.orderItems.productId` → `products._id`
