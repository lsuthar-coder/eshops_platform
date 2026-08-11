# Portal Backend

Handles new-store creation: writes the tenant + admin record and the store
config object, and returns the final status **in the same request**.

## Why there's no pipeline anymore

Store subdomains are `<tenantId>.eshops.lsuthar.in`, covered by a single
wildcard Ingress + wildcard cert for `*.eshops.lsuthar.in` (provisioned
once, outside this service). Since the wildcard already routes any tenant
subdomain to the shared storefront pods, there is no per-tenant Kubernetes
object left to create — so `createTenant` just writes Postgres (identity),
Mongo (config), and Redis (fast-read cache) directly, synchronously.

Jenkins is **not used by this service**. It's reserved for the one thing
that still needs real per-request infrastructure work: custom domain
onboarding (Ingress + cert-manager HTTP-01 for a domain the platform
doesn't already have a wildcard for), triggered later from the Admin
dashboard/Admin API — not from this creation flow.

## Setup

```bash
npm install
cp .env.example .env   # fill in real values
psql "$POSTGRES_URL" -f sql/001_create_tenants_table.sql
npm run dev
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/portal/otp/send` | Send a 6-digit code via Resend (`{ mail }`) |
| POST | `/api/portal/otp/verify` | Verify the code (`{ mail, otp }`) |
| POST | `/api/portal/tenants` | Create a store — synchronous, returns final status |
| GET | `/api/portal/tenants/:tenantId/status` | Look up status by tenant ID |
| GET | `/api/portal/tenants/status?mail=...` | Look up status by mail — recovery path for refreshes/dropped connections |
| GET | `/health` | Liveness check |

## OTP flow

- `otp:<mail>` in Redis holds the current code, 5-minute TTL.
- `otp:cooldown:<mail>` blocks resend spam for 30 seconds.
- `otp:verified:<mail>` is set for 15 minutes once verified, and is
  **checked server-side** in `createTenant` — a disabled submit button
  in the UI is a nicety, not the actual enforcement.
- Verification is single-use: consumed the moment a store is created.

## Mail-based status recovery

Every tenant creation writes `portal:mail:<mail>` in Redis
(`{ tenantId, status, storeUrl, adminPortalUrl }`). If Redis is cold for
that key, `getTenantStatusByMail` falls back to a Postgres lookup by
`admin_mail` and repopulates Redis.

## Still out of scope for this service (by design)

- Store content (products, categories, banners, pages) — belongs to
  Admin API / Store API, operating on an existing tenant.
- Custom domain provisioning — a separate, genuinely async flow (Ingress +
  cert-manager), triggered from the Admin dashboard once a store already
  exists.
- Payment gateway keys — never touch this service.
