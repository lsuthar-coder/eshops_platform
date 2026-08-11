import { StoreConfig } from "../models/storeConfig.js";
import { redis } from "../db/redis.js";
import { isCertificateReady } from "../utils/k8sClient.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Runs on an interval (wired up in server.js). For every tenant with a
 * domain still 'pending', checks whether cert-manager has finished
 * issuing the certificate yet. This is the piece that eventually flips
 * status to 'verified' — Jenkins only ever creates the resources once,
 * it doesn't wait around for DNS propagation.
 */
export async function runCertificateReadinessCheck() {
  const pendingDocs = await StoreConfig.find({
    "domain.status": "pending",
    "domain.domainName": { $ne: null },
  });

  if (pendingDocs.length === 0) return;

  logger.info({ count: pendingDocs.length }, "Checking pending domain certificates");

  for (const doc of pendingDocs) {
    const ready = await isCertificateReady(doc.tenantId);
    if (!ready) continue;

    doc.domain.status = "verified";
    doc.domain.certIssued = true;
    await doc.save();

    const domainHost = `${doc.tenantId}.${env.platformDomain}`;
    for (const key of [`config:domain:${domainHost}`, `config:uuid:${doc.tenantId}`]) {
      const existingRaw = await redis.get(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      await redis.set(
        key,
        JSON.stringify({ ...existing, tenantId: doc.tenantId, domain: doc.domain })
      );
    }

    logger.info({ tenantId: doc.tenantId, domain: doc.domain.domainName }, "Domain verified");
  }
}
