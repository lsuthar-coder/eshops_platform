// Same-origin by default — see the deployment note in Store API's
// resolveTenant.js for why this MUST be same-origin in production
// (Ingress routes /api/* on the tenant's own hostname to Store API).
// VITE_API_BASE_URL is a local-dev-only escape hatch for when you're
// running `npm run dev` against a Store API on a different port.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Dev-only: lets local development target a specific tenant without
// real subdomain DNS/Ingress routing. Ignored by Store API in
// production regardless of what's sent — see resolveTenant.js.
const DEV_TENANT_HOST = import.meta.env.VITE_DEV_TENANT_HOST || null;

export class StoreNotFoundError extends Error {}

export async function getStoreConfig() {
  const response = await fetch(`${BASE_URL}/api/store/config`, {
    headers: DEV_TENANT_HOST ? { "x-dev-tenant-host": DEV_TENANT_HOST } : {},
  });

  if (response.status === 404) {
    throw new StoreNotFoundError("Store not found");
  }

  if (!response.ok) {
    throw new Error("Something went wrong loading this store");
  }

  return response.json();
}
