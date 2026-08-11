# Store API

Public, customer-facing service. Every request is resolved to a tenant
from the `Host` header before any route handler runs.

## What's implemented vs. stubbed

- **`middleware/resolveTenant.js`** — fully implemented. Reads the `Host`
  header, looks up `config:domain:<host>` in Redis, falls back to Mongo
  (`StoreConfig.domainHost`) on a cache miss and self-heals the cache.
  404s on an unrecognized host. This is the tenant-isolation boundary —
  every route sits behind it.
- **`middleware/requireCustomerAuth.js`** — fully implemented.
  `requireCustomerAuth` hard-rejects requests without a valid session;
  `optionalCustomerAuth` attaches `req.userId` if present but allows
  anonymous requests through (needed for guest checkout). Both verify
  the JWT's `tenantId` claim against `req.tenantId` — this is the check
  that stops a token issued for one store being replayed against
  another, since all tenants share one signing secret.
- **Every route in `routes/`** is a stub — returns `{ status: "ok" }`.
  Each has a comment describing what it should do, which fields it must
  scope by (`tenantId`, and `userId` where relevant), and any tenant-
  isolation gotcha specific to that route. Implement the ones you need,
  delete the rest.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Route map

See comments in each `routes/*.js` file for the full behavior spec per
route. Mounted paths:

| File | Mounted at |
|---|---|
| `auth.js` | `/api/store/auth` |
| `config.js` | `/api/store` (`/config`, `/pages/:type`) |
| `products.js` | `/api/store/products` |
| `categories.js` | `/api/store` (`/categories`, `/search`) |
| `cart.js` | `/api/store/cart` |
| `orders.js` | `/api/store/orders` |
| `wishlist.js` | `/api/store/wishlist` |
| `reviews.js` | `/api/store` (`/products/:id/reviews`) |
