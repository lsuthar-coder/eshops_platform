# Admin API

Store owner's management service. Called only from the fixed
`ADMIN_PORTAL_URL` app — every tenant's admin logs into the same URL,
unlike Store API where each tenant has its own subdomain.

## What's real vs. still a stub

Everything backing the 5-tab admin dashboard (Main/config, Orders,
Products, Reviews, plus Cloudinary upload signatures and payment
settings) is **fully implemented**, not a stub:

- **`middleware/requireAdminAuth.js`** — also the tenant-resolution
  step for this service (see the comment in that file). Since every
  tenant shares one fixed admin URL, there's no `Host`-header-based
  resolution like Store API has — `req.tenantId` comes from the JWT's
  `tenantId` claim, set at login.
- **`services/authService.js`** — real login: checks `admin_mail` +
  `password_hash` against Portal's `tenants` table (same Postgres
  database), issues a 12h JWT.
- **`services/configService.js`** — real config read/update, with
  write-through to Redis in the same request (no stale-read window).
  Partial `PATCH` bodies are flattened to dot-notation before `$set` —
  this matters: a naive `$set: { logo: { main: "x" } }` would silently
  wipe `logo.small` if it wasn't included in that request. See the
  comment in `flattenPatch()`.
- **`services/paymentSettingsService.js`** — real, AES-256-GCM
  encrypted at rest in a separate `payment_credentials` Postgres table.
  Raw keys are never returned to the client, even to the tenant's own
  admin — only a masked preview.
- **`utils/cloudinary.js`** — real signed-upload signature generation
  (Cloudinary's documented HMAC-SHA1 scheme, implemented directly, no
  SDK dependency). Signatures are scoped to `<tenantId>/<folder>`, which
  is what actually prevents cross-tenant upload abuse.
- **Products, Orders, Reviews routes** — real Mongoose CRUD, all scoped
  by `req.tenantId`.

**Not built in this pass** (documented, not forgotten):
- `mainPage.banners` / `featuredProductIds` / `categoryIds` and the
  `pages` array have schema support (`models/storeConfig.js`) but no
  dedicated routes/UI yet beyond the generic `PATCH /config` — the admin
  frontend's Main page form doesn't edit these yet either (see its
  README for why banners specifically need a bespoke editor).
- Custom domain Ingress/cert provisioning — `PATCH /config` updates the
  `domain` object and resets verification status when the domain name
  changes, but nothing here actually calls Kubernetes or Jenkins yet.
  That integration point is `domain.status` transitioning away from
  `pending` — wire it up when you build that flow.
- Review moderation (approve/reject) — the schema has a `status` field,
  defaulted to `approved` (auto-approve for v1), but no route flips it.

## Setup

```bash
npm install
cp .env.example .env
psql "$POSTGRES_URL" -f sql/001_create_payment_credentials_table.sql
npm run dev
```

Generate `ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Route map

| File | Mounted at | Auth |
|---|---|---|
| `auth.js` | `/api/admin/auth` | `/login` open, `/me` protected |
| `config.js` | `/api/admin` (`/config`, `/pages/:type`) | protected |
| `products.js` | `/api/admin/products` | protected |
| `orders.js` | `/api/admin/orders` | protected |
| `reviews.js` | `/api/admin/reviews` | protected |
| `assets.js` | `/api/admin/assets` | protected |
| `paymentSettings.js` | `/api/admin/payment-settings` | protected |

## Custom domain provisioning (new)

The piece that was previously just a `domain` field on `PATCH /config`
is now a full flow:

1. **`POST /api/admin/domain`** — admin submits a domain. Sets
   `domain.status = 'pending'`, records `domain.updatedAt` (anchors the
   7/14-day clock), and triggers the Jenkins pipeline
   (`jenkins/Jenkinsfile.domain-provision`) that creates the Ingress +
   cert-manager `Certificate` for that domain. Returns immediately —
   this is a fire-and-forget trigger, not a wait.
2. **`POST /api/admin/webhooks/jenkins-domain-callback`** — Jenkins
   reports back once it's *attempted* resource creation. Success here
   only means "the Ingress/Certificate objects were created," not "the
   certificate is issued" — DNS propagation can take hours, far longer
   than a Jenkins job should block on. This callback only ever moves
   status to `rejected` (creation itself failed); it never sets
   `verified`.
3. **`jobs/certificateReadinessJob.js`** — runs every 10 minutes,
   queries the Kubernetes API directly (`@kubernetes/client-node`) for
   each pending domain's `Certificate` resource, and flips
   `status: 'verified'` once cert-manager reports `Ready: True`. This
   is what actually detects successful verification — not Jenkins.
4. **`jobs/domainLifecycleJob.js`** — runs daily. 7 days pending with
   no alert sent yet → emails the admin (Resend). 14 days pending →
   sets `status: 'suspended'`. The tenant's original generated URL
   (`<tenantId>.eshops.lsuthar.in`) is unaffected either way — only the
   custom domain is suspended.
5. **`GET /api/admin/domain/status`** — returns current status plus the
   DNS setup instructions and target IP the frontend displays (A
   record, DNS-only / no proxy, propagation may take time).

**Assumption baked into `k8sClient.js` and the Jenkinsfile**: the
Certificate resource is named `tenant-<tenantId>-domain` in the
`K8S_NAMESPACE` namespace. If your actual cluster naming differs, update
both together — they have to agree.

**RBAC note**: this service now needs read access to `cert-manager.io`
`Certificate` resources via a Kubernetes `ServiceAccount`. Scope it
narrowly — read-only on that one resource type, nothing broader.
