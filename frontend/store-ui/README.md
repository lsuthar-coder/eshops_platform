# Storeforge Store UI

Customer-facing storefront. Single page: loader → fetch config → render
store, or "store not found" if the tenant doesn't resolve.

## Critical deployment requirement

Store API resolves which tenant a request belongs to from the **Host
header of the API request itself** (see `resolveTenant.js` in
store-api). That means this app and Store API **must be served from the
same hostname** in production:

```
<tenantId>.eshops.lsuthar.in/          -> this frontend
<tenantId>.eshops.lsuthar.in/api/*     -> Store API
```

Both routed by the same Ingress rule, split by path. A separately-hosted
API subdomain (the pattern Portal UI and Admin UI use) will NOT work
here — the browser's fetch would carry the wrong Host header and every
tenant lookup would 404.

## Local development

Since localhost has no real subdomain routing, set two dev-only env
vars (both explicitly ignored by Store API when `NODE_ENV=production`,
so this can't leak into a real deployment):

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:4000
# VITE_DEV_TENANT_HOST=<a real tenantId>.eshops.lsuthar.in
npm install
npm run dev
```

## Flow

1. **Loading** — liquid loader while `GET /api/store/config` is in flight.
2. **Found** — renders `HomePage`: logo/store name, a hero banner if one
   exists (`mainPage.banners`, type `"main"`, `active: true`), gallery
   if enabled, social links, and a footer showing **both URLs** (the
   always-on generated URL, and the custom domain if `status: verified`)
   plus a "Manage this store" link to the fixed admin portal.
3. **Not found** — Store API's `resolveTenant` middleware 404s on an
   unrecognized host; this renders a plain "Store not found" screen with
   an optional link back to the platform's own creation portal.

## Theming

`hooks/useApplyTheme.js` overrides the base liquid-glass color tokens
with the tenant's chosen `theme.primaryColor` / `secondaryColor` /
`tertiaryColor` at runtime, and swaps the favicon/page title from
config — this is what makes each generated store look distinct while
keeping the same structural design system.

## Not built in this pass

- Product listing/detail, cart, checkout, search, reviews, wishlist —
  Store API has real routes for `/config` only; everything else is
  still the stubbed routes from the earlier delivery. This app is the
  "does a skeleton store render from config" piece specifically asked
  for — extending it to a full storefront is a separate, larger task.
