import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

function getAuthHeader() {
  const { user, apiToken } = env.jenkins;
  return "Basic " + Buffer.from(`${user}:${apiToken}`).toString("base64");
}

async function jenkinsFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: getAuthHeader() },
  });
}

/**
 * Triggers the pipeline that creates an Ingress rule + cert-manager
 * Certificate (HTTP-01) for a tenant's custom domain. This is the one
 * place in the whole platform that still genuinely needs Jenkins/K8s
 * orchestration — every other per-tenant routing concern is covered by
 * the wildcard *.eshops.lsuthar.in Ingress/cert set up once in Phase 0.
 */
export async function triggerDomainPipeline({ tenantId, domainName }) {
  const url = `${env.jenkins.url}/job/${encodeURIComponent(
    env.jenkins.domainJob
  )}/buildWithParameters`;

  const body = new URLSearchParams({ TENANT_ID: tenantId, DOMAIN: domainName });

  const response = await jenkinsFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to trigger Jenkins domain pipeline: ${response.status} ${text}`
    );
  }

  logger.info({ tenantId, domainName }, "Jenkins domain pipeline triggered");
}
