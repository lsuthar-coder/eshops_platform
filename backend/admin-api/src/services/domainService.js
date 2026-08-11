import { StoreConfig } from "../models/storeConfig.js";
import { redis } from "../db/redis.js";
import { triggerDomainPipeline } from "./jenkinsService.js";
import { env } from "../config/env.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

const DOMAIN_RE = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

async function writeThroughDomainCache(doc) {
  const publicPatch = { tenantId: doc.tenantId, domain: doc.domain };
  const domainHost = `${doc.tenantId}.${env.platformDomain}`;

  // Merge into whatever's already cached rather than overwriting the
  // whole config — domain changes shouldn't clobber theme/products/etc.
  for (const key of [`config:domain:${domainHost}`, `config:uuid:${doc.tenantId}`]) {
    const existingRaw = await redis.get(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    await redis.set(key, JSON.stringify({ ...existing, ...publicPatch }));
  }
}

/**
 * Submitting a domain does three things in one request: updates the
 * config (status -> pending, clock reset), and triggers the Jenkins
 * pipeline that creates the Ingress + cert-manager Certificate for it.
 * The pipeline's actual result comes back later via the webhook, not
 * this response — this only confirms the request was accepted.
 */
export async function submitDomain(tenantId, domainName) {
  if (!domainName || !DOMAIN_RE.test(domainName)) {
    throw new ValidationError("A valid domain name is required");
  }

  const doc = await StoreConfig.findOneAndUpdate(
    { tenantId },
    {
      $set: {
        "domain.domainName": domainName,
        "domain.status": "pending",
        "domain.updatedAt": new Date(),
        "domain.certIssued": false,
        "domain.alertSentAt": null,
      },
    },
    { new: true }
  );

  if (!doc) {
    throw new NotFoundError("Store config not found");
  }

  await writeThroughDomainCache(doc);

  // Trigger after the DB write, not before — if Jenkins is unreachable,
  // the domain is still recorded as pending and the lifecycle job will
  // eventually alert on it rather than the request just failing silently.
  try {
    await triggerDomainPipeline({ tenantId, domainName });
  } catch (error) {
    await StoreConfig.updateOne(
      { tenantId },
      { $set: { "domain.status": "rejected" } }
    );
    throw error;
  }

  return doc.domain;
}

export async function getDomainStatus(tenantId) {
  const doc = await StoreConfig.findOne({ tenantId }, { domain: 1, tenantId: 1 });
  if (!doc) {
    throw new NotFoundError("Store config not found");
  }

  return {
    ...doc.domain.toObject(),
    generatedUrl: `https://${doc.tenantId}.${env.platformDomain}`,
    targetIp: env.platformIngressIp,
    instructions: [
      `Go to your domain's DNS settings with your registrar/DNS provider.`,
      `Add an A record for your domain pointing to: ${env.platformIngressIp}`,
      `Set the record to "DNS only" — do NOT enable any proxy (e.g. Cloudflare's orange-cloud), since that blocks certificate verification.`,
      `DNS changes can take anywhere from a few minutes to a few hours to take effect. We'll keep checking automatically.`,
    ],
  };
}

/**
 * Called by Jenkins (via the webhook route) once it's attempted to
 * create the Ingress + Certificate resources. This is NOT the final
 * verification result — cert-manager's HTTP-01 challenge can take
 * anywhere from minutes to (per DNS propagation worst-cases) many
 * hours, well beyond what's reasonable for a Jenkins job to block on.
 *
 * So this callback only ever moves status to 'rejected' (the resource
 * creation itself failed — bad domain, kubectl error, etc.) — it never
 * sets 'verified'. Actual verification is detected by
 * jobs/certificateReadinessJob.js polling the Certificate's Ready
 * condition directly against the Kubernetes API on an interval.
 */
export async function handleDomainCallback({ tenantId, resourcesCreated }) {
  if (resourcesCreated) {
    // Nothing to change — already 'pending' from submission, and stays
    // that way until the readiness job confirms it or the lifecycle
    // job's 14-day threshold suspends it.
    return { tenantId, acknowledged: true };
  }

  const doc = await StoreConfig.findOneAndUpdate(
    { tenantId },
    { $set: { "domain.status": "rejected" } },
    { new: true }
  );

  if (!doc) {
    throw new NotFoundError("Tenant not found for domain webhook callback");
  }

  await writeThroughDomainCache(doc);
  return { tenantId, acknowledged: true };
}
