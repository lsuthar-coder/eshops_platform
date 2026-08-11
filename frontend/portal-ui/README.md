# Storeforge Portal UI

Liquid glass-themed React app for store creation. Two pages: **Create store**
(form + OTP-gated submit) and **Check status** (mail-based lookup).

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your portal_backend URL
npm run dev
```

## Design notes

- **Tailwind v4**, config lives in `src/index.css` via `@theme` (no separate
  `tailwind.config.js` — v4 uses CSS-first configuration).
- Fonts loaded via `<link>` tags in `index.html` (Space Grotesk for display,
  IBM Plex Sans for body, IBM Plex Mono for codes/URLs).
- The liquid loader in `ResultDialog` is the signature visual element,
  shown briefly while a request is in flight — everything else stays
  restrained around it.
- `prefers-reduced-motion` is respected — the aurora background and liquid
  loader stop animating for users who've asked for that.

## Flow

1. **Create store** — fill in store name, your name, mail, password.
   "Send code" emails a 6-digit OTP. Entering the correct code unlocks
   submit. Editing the mail after verifying resets verification.
2. Submitting calls `POST /tenants`, which now resolves **synchronously**
   — no pipeline, no polling. The dialog shows a brief loading state, then
   the Store URL and a **"Login to admin portal"** button (URL is a
   placeholder from the backend's `ADMIN_PORTAL_URL` until the Admin
   Portal app exists).
3. **Check status** — mail-based lookup for anyone who lost their
   confirmation or wants to find their store/admin URLs again. Also a
   single request, no polling.

## Why no polling

Earlier versions of this app polled every 15 seconds while a Jenkins
pipeline created a per-tenant Ingress rule. That's no longer necessary —
tenant subdomains (`<uuid>.eshops.lsuthar.in`) are covered by a wildcard
Ingress/cert set up once, outside this app, so store creation is a plain
synchronous DB write and returns its final result in one request.

## Still to build (not in this UI)

- The actual Admin Portal app — `ADMIN_PORTAL_URL` is a placeholder until
  that exists.
- The storefront/admin dashboard apps themselves (this is only the
  creation portal).
- A visible cooldown countdown on "Resend" (the backend enforces a 30s
  cooldown server-side; the button doesn't yet reflect that visually).
