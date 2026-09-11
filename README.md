# NLC Inventory Management System

A full-stack, production-style inventory management platform built for tracking stock,
suppliers, categories, locations and transactions across NLC India Ltd.'s plant
maintenance stores — with a Claude-powered conversational assistant for natural-language
inventory queries.

> Built as a portfolio/interview-ready reconstruction of an internal MERN inventory
> system, with real authentication, role-based authorization, a transactional stock
> ledger, dashboards backed by live aggregation queries, CSV reporting, and a tool-based
> AI assistant that never gets unrestricted database access.

---

## 1. Feature Overview

- **Authentication & Authorization** — JWT auth, bcrypt password hashing, three roles
  (Admin / Manager / Staff) with route- and field-level permission checks.
- **Inventory Management** — full CRUD on products (SKU, category, supplier, location,
  stock levels, pricing), server-side search/filter/sort/pagination.
- **Stock Operations** — Stock In / Stock Out / Return / Adjustment, each producing an
  immutable `InventoryTransaction` audit record. Stock can never go negative.
- **Dashboard** — live aggregated KPIs and charts (category value, category mix, stock
  movement over time) computed directly from MongoDB, never hardcoded.
- **Catalog management** — Categories, Suppliers, Locations, each with usage stats and
  delete-guarded against orphaning products.
- **Reporting** — 7 report types (summary, low stock, out of stock, valuation, category,
  supplier, stock movement) with filters and CSV export.
- **AI Inventory Assistant** — a chat interface backed by the Claude API using a
  restricted, read-only tool-calling architecture (see [§8](#8-ai-assistant-architecture)).
- **Responsive enterprise UI** — sidebar + topbar shell, data tables, modals, toasts,
  loading/empty/error states, built with React + Tailwind CSS.

---

## 2. Tech Stack

| Layer      | Technology                                                            |
|------------|------------------------------------------------------------------------|
| Frontend   | React 18, Vite, React Router 6, Tailwind CSS, Recharts, Axios, react-hot-toast |
| Backend    | Node.js, Express 4                                                     |
| Database   | MongoDB + Mongoose                                                     |
| Auth       | JSON Web Tokens (JWT), bcryptjs                                        |
| AI         | Anthropic Claude API (`@anthropic-ai/sdk`), tool-use / function calling |
| Testing    | Jest + Supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend) |

---

## 3. Architecture

```
React (Vite SPA)
      │  Axios (JWT bearer token)
      ▼
Express REST API  ──►  Mongoose Models  ──►  MongoDB
      │
      ▼
AI Chat Endpoint (/api/ai/chat)
      │
      ▼
claudeService.js  ──►  Claude API (tool-use loop)
      │                        │
      │      tool_use requests │  (read-only, whitelisted)
      ▼                        ▼
inventoryTools.js  ──────────────────►  MongoDB (read-only queries)
      │
      ▼
Natural-language answer ──► Frontend chat UI
```

### Backend layout

```
backend/
  src/
    config/        env.js, db.js
    controllers/    one per resource (auth, product, inventory, category, ...)
    middleware/     authMiddleware, roleMiddleware, errorMiddleware, rateLimiters, validate
    models/         User, Product, Category, Supplier, Location, InventoryTransaction
    routes/         REST route definitions, wired to controllers + middleware
    services/       inventoryService.js (stock ledger logic), claudeService.js (AI orchestration)
    ai/             inventoryTools.js (read-only DB functions), toolDefinitions.js (Claude tool schema)
    validators/     express-validator chains per resource
    utils/          ApiError, asyncHandler, apiResponse, csv, generateToken
    seed/           seedData.js, seed.js
    app.js, server.js
  tests/            Jest + Supertest integration tests
```

### Frontend layout

```
frontend/
  src/
    components/     ui/ (Button, Card, Modal, Badge, Pagination, ...), layout/, charts/, inventory/, catalog/, ai/
    pages/          LoginPage, DashboardPage, InventoryPage, ProductDetailsPage, CategoriesPage,
                     SuppliersPage, LocationsPage, TransactionsPage, ReportsPage, AIAssistantPage,
                     UsersPage, SettingsPage
    layouts/        AppLayout.jsx (sidebar + topbar shell)
    routes/         ProtectedRoute.jsx, RoleRoute.jsx
    services/       one Axios-based service module per API resource
    context/        AuthContext.jsx
    hooks/          useDebounce.js
    utils/          format.js
```

---

## 4. Database Design

| Collection             | Purpose                                                              |
|-------------------------|-----------------------------------------------------------------------|
| `users`                | Auth accounts: name, email, hashed password, role, isActive          |
| `categories`           | Product categories                                                    |
| `suppliers`            | Supplier directory                                                     |
| `locations`            | Physical storage locations                                            |
| `products`             | Inventory items — references category/supplier/location, quantity, pricing, computed `status` |
| `inventorytransactions`| Immutable ledger of every stock change (type, quantity, before/after, user, reason) |

Indexes: `products` has a text index on `name/sku/brand` plus single-field indexes on
`category`, `location`, `supplier` and `status` for fast filtering; `categories` and
`suppliers` have text indexes for name search; `inventorytransactions` is indexed on
`(product, createdAt)` and `(type, createdAt)` for fast history and reporting queries.

**Why references instead of embedding:** categories/suppliers/locations are managed
independently (their own CRUD + stats), and many products point at the same one, so they
are referenced by ObjectId and populated on read rather than duplicated into every
product document.

**Stock integrity:** all quantity changes go through `inventoryService.js`, which uses a
single atomic `findOneAndUpdate` guarded by the current quantity (`quantity: { $gte: n }`)
for stock-out, so two concurrent requests cannot drive stock negative — without requiring
MongoDB replica-set transactions, so it runs against a plain standalone `mongod`.

---

## 5. Authentication & Roles

JWT-based, stateless auth. Tokens are issued on register/login and sent as
`Authorization: Bearer <token>`. Passwords are hashed with bcrypt (10 salt rounds) and
never returned by the API.

| Capability                          | Admin | Manager | Staff |
|--------------------------------------|:-----:|:-------:|:-----:|
| View inventory, search, transactions |  ✅   |   ✅    |  ✅   |
| Stock In / Stock Out / Return        |  ✅   |   ✅    |  ✅   |
| Stock Adjustment                     |  ✅   |   ✅    |  ❌   |
| Create / edit products               |  ✅   |   ✅    |  ❌   |
| Delete products                      |  ✅   |   ❌    |  ❌   |
| Manage categories/suppliers/locations|  ✅   |   ✅    |  ❌   |
| Delete categories/suppliers/locations|  ✅   |   ❌    |  ❌   |
| View reports                         |  ✅   |   ✅    |  ❌   |
| Manage users                         |  ✅   |   ❌    |  ❌   |
| Use AI Assistant                     |  ✅   |   ✅    |  ✅   |

Self-registration always creates a `staff` account; an admin promotes users afterwards
via **Users → change role**.

---

## 6. REST API Summary

All routes are prefixed with `/api` and (except `/auth/register`, `/auth/login`) require
`Authorization: Bearer <token>`.

```
Auth
  POST   /auth/register
  POST   /auth/login
  GET    /auth/me
  POST   /auth/logout

Products
  GET    /products?search=&category=&location=&supplier=&status=&sortBy=&sortDir=&page=&limit=
  GET    /products/:id
  POST   /products                 (admin, manager)
  PUT    /products/:id             (admin, manager)
  DELETE /products/:id             (admin)

Inventory
  POST   /inventory/stock-in       (admin, manager, staff)
  POST   /inventory/stock-out      (admin, manager, staff)
  POST   /inventory/return         (admin, manager, staff)
  POST   /inventory/adjust         (admin, manager)
  GET    /inventory/transactions?type=&startDate=&endDate=&page=&limit=
  GET    /inventory/transactions/:productId

Categories / Suppliers / Locations   (same shape for each)
  GET    /<resource>
  GET    /<resource>/:id
  POST   /<resource>                (admin, manager)
  PUT    /<resource>/:id            (admin, manager)
  DELETE /<resource>/:id            (admin)

Dashboard
  GET    /dashboard/summary
  GET    /dashboard/category-stats
  GET    /dashboard/stock-movement?days=

Reports (admin, manager)             — add &format=csv to any of these to download
  GET    /reports/inventory-summary
  GET    /reports/low-stock
  GET    /reports/out-of-stock
  GET    /reports/valuation
  GET    /reports/category
  GET    /reports/supplier
  GET    /reports/stock-movement

Users (admin)
  GET    /users
  PUT    /users/:id
  DELETE /users/:id

AI
  POST   /ai/chat                  { message, history }
```

---

## 7. AI Assistant Architecture

This is the feature most worth walking through in an interview, because the design
deliberately avoids the naive (and unsafe) approach of handing an LLM raw database
access.

**The naive approach we avoided:** dumping the whole inventory collection into the
prompt, or letting Claude write its own MongoDB queries. Both leak data outside the
allowed scope and open the door to prompt-injected destructive queries.

**What we built instead — a tool-calling loop:**

1. The frontend sends `{ message, history }` to `POST /api/ai/chat`.
2. `services/claudeService.js` calls the Claude API with the user's message plus a
   **fixed list of tool definitions** (`ai/toolDefinitions.js`) — JSON-schema
   descriptions of ~12 read-only functions like `getLowStockProducts`,
   `getProductsBySupplier`, `getInventoryValue`, `getStockMovement`, etc.
3. Claude decides which tool(s) it needs and returns a `tool_use` block with the
   function name + arguments. **Claude never sees a connection string, a Mongoose
   model, or query syntax** — only these named functions and their declared parameters.
4. The backend executes the corresponding function from `ai/inventoryTools.js` against
   MongoDB (read-only, `.lean()`, capped at 25 results) and returns the JSON result to
   Claude as a `tool_result`.
5. Claude may request more tools (loop, capped at 5 rounds) or produce a final
   natural-language answer, which is returned to the frontend.

**Security properties this gives us:**

- Claude can only call the ~12 functions explicitly exported from `inventoryTools.js` —
  there is no code path from a tool call to `deleteOne`, `updateMany`, environment
  variables, the `users` collection, or arbitrary query execution.
- Every tool caps its result size and only returns inventory-shaped summaries, not raw
  documents — so a single call can't exfiltrate the whole database.
- The system prompt explicitly instructs Claude to refuse destructive requests (e.g.
  "delete all products") and explain that such actions must be done through the UI by
  an authorized user — and even if Claude "agreed" to try, there is no tool that could
  carry it out.
- API failures (missing key, rate limits, timeouts, malformed responses) are all caught
  in `claudeService.js` and turned into clear, non-leaky error messages.

---

## 8. Environment Setup

### Backend (`backend/.env`, copy from `backend/.env.example`)

```
NODE_ENV=development
PORT=5050
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/nlc_inventory

JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d

ANTHROPIC_API_KEY=<your Anthropic API key>
CLAUDE_MODEL=claude-sonnet-5

AUTH_RATE_LIMIT_MAX=20
AI_RATE_LIMIT_MAX=30
```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Get an Anthropic API key from https://console.anthropic.com/ — the app runs fully
without one, except the AI Assistant page will show a clear "not configured" message
instead of an answer.

### Frontend (`frontend/.env`, copy from `frontend/.env.example`)

```
VITE_API_URL=http://localhost:5050/api
```

---

## 9. Installation & Running Locally

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local `mongod`, Docker, or Atlas)

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# then edit backend/.env: set JWT_SECRET, MONGO_URI, and (optionally) ANTHROPIC_API_KEY
```

### 3. Start MongoDB

```bash
mongod --dbpath /path/to/your/data --port 27017
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

This wipes and repopulates: 3 users, 10 categories, 8 suppliers, 6 locations, ~40
products and ~200+ historical stock transactions. Credentials are printed at the end of
the run (also listed below).

### 5. Run the backend

```bash
cd backend
npm run dev      # nodemon, http://localhost:5050
```

### 6. Run the frontend

```bash
cd frontend
npm run dev       # http://localhost:5173
```

Open http://localhost:5173 and sign in with one of the seeded accounts below.

---

## 10. Test Credentials (seeded)

| Role    | Email                        | Password     |
|---------|-------------------------------|--------------|
| Admin   | admin@nlcindia.example         | Admin@123    |
| Manager | manager@nlcindia.example       | Manager@123  |
| Staff   | staff@nlcindia.example         | Staff@123    |

---

## 11. Testing

### Backend (Jest + Supertest + in-memory MongoDB)

```bash
cd backend
npm test
```

Covers: registration/login/authorization, product CRUD + role checks, stock in/out/adjust
(including negative-stock prevention), category delete-guarding, dashboard aggregation
correctness, and the AI tool functions in isolation.

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm test
```

Covers: shared UI components (Badge/status labels), formatting utilities, and the login
form's interaction with the auth service.

---

## 12. Screenshots

_Add screenshots of the Dashboard, Inventory table, Product Details, and AI Assistant
here before sharing this project externally._

---

## 13. Future Improvements

- Barcode/QR scanning for stock in/out on mobile devices
- Purchase order workflow (supplier POs → auto stock-in on receipt)
- Email/SMS alerts when a product crosses its minimum stock threshold
- Multi-warehouse transfer requests (location → location, not just in/out)
- Audit log for catalog (category/supplier/location) edits, not just stock
- Streaming responses for the AI assistant instead of a single request/response
- Role-scoped API keys / SSO integration for a real enterprise rollout

---

## 14. Known Limitations

- Stock quantity mutations are made atomic via a guarded single-document update rather
  than a multi-document MongoDB transaction, so they work against a standalone `mongod`
  (no replica set required) — this is a deliberate trade-off documented in
  `inventoryService.js`.
- The AI assistant keeps conversation history client-side only (last 10 messages); there
  is no server-side chat persistence.
- CSV export streams the full filtered result set in one response (no server-side
  pagination on export) — fine at this data scale, would need chunking at much larger scale.
  <img width="1677" height="929" alt="Screenshot 2026-09-11 at 1 25 44 PM" src="https://github.com/user-attachments/assets/75e5d130-e255-44a1-8d91-21744e23c750" />
<img width="1677" height="929" alt="Screenshot 2026-09-11 at 1 25 16 PM" src="https://github.com/user-attachments/assets/916c1f72-fac5-484f-b3fe-9c55e1aa654e" />
<img width="3354" height="1858" alt="image" src="https://github.com/user-attachments/assets/2fdb18db-8f15-4298-9cfb-fb195dfea2bd" />

