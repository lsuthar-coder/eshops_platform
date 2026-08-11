# Storeforge Admin UI

Store owner's dashboard. Same liquid glass design system as the Portal
UI. Five tabs: **Main** (config form), **Analytics** (placeholder),
**Orders**, **Products**, **Reviews**.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your admin-api URL
npm run dev
```

## Auth

JWT is stored in `localStorage` after login (`context/AuthContext.jsx`).
On app load, if a token exists, `GET /api/admin/auth/me` confirms it's
still valid before showing the dashboard; a 401 anywhere clears the
token and redirects to `/login`. This is a pragmatic choice for now —
an httpOnly cookie would be more resistant to XSS if this becomes a
real production concern later.

## Main page (config form)

Each section (Domain, Theme, Branding, Business details, Customer
support, Footer, Payment gateways, Search filters, Gallery) saves
independently via its own **Save** button — a `PATCH /api/admin/config`
with just that section's slice, not the whole document. This keeps
payloads small and means one section's typo doesn't block saving
another.

**Simplification made here:** `mainPage.banners`, `mainPage.featuredProductIds`,
`mainPage.categoryIds`, and `pages` from the full config schema are
**not** in this form yet — banners in particular have mixed field types
(number, enum, boolean, nested image array) that don't fit the generic
`RepeatableList` pattern used for the simpler array fields. Worth a
dedicated banner editor component as a follow-up; everything else
repeatable (footer links/social, gallery images, search filters) uses
`components/RepeatableList.jsx`, which wraps flat string arrays via
`StringListEditor` in `MainPage.jsx`.

## Products

"Add product" opens a dialog that uploads an image **directly to
Cloudinary** (via `hooks/useCloudinaryUpload.js`, using a signature
issued by Admin API — image bytes never pass through the backend), then
posts the resulting URL + form fields to `POST /api/admin/products`.
"Remove" is a hard delete — matches what was asked for; note the
backend README flags that a real deployment might prefer a soft-delete
if orders can reference a product.

## Reviews

Product filter dropdown reuses the products list already fetched for
the Products tab's data shape, calling `GET /api/admin/reviews?productId=...`.
