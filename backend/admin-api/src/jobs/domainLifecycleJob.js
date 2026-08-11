import { StoreConfig } from "../models/storeConfig.js";
import { pool } from "../db/postgres.js";
import { sendDomainAlertEmail } from "../services/emailService.js";
import { logger } from "../utils/logger.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALERT_THRESHOLD_MS = 7 * DAY_MS;
const SUSPEND_THRESHOLD_MS = 14 * DAY_MS;

async function getAdminMail(tenantId) {
  const result = await pool.query(
    "SELECT admin_mail FROM tenants WHERE tenant_id = $1",
    [tenantId]
  );
  return result.rows[0]?.admin_mail || null;
}

/**
 * Runs daily (wired up in server.js). Two thresholds, both anchored on
 * domain.updatedAt (set once, at submission — not touched again until
 * either verified or the domain is changed):
 *
 *   7 days,  still pending, no alert sent yet -> email the admin
 *   14 days, still pending                    -> suspend the domain
 *
 * Suspending only affects the custom domain — the tenant's original
 * generated URL (<tenantId>.eshops.lsuthar.in) keeps working the whole
 * time, since that's on the always-on wildcard, unrelated to this.
 */
export async function runDomainLifecycleCheck() {
  const now = Date.now();

  const pendingDocs = await StoreConfig.find({
    "domain.status": "pending",
    "domain.domainName": { $ne: null },
    "domain.updatedAt": { $ne: null },
  });

  for (const doc of pendingDocs) {
    const age = now - new Date(doc.domain.updatedAt).getTime();

    if (age >= SUSPEND_THRESHOLD_MS) {
      doc.domain.status = "suspended";
      await doc.save();
      logger.warn(
        { tenantId: doc.tenantId, domain: doc.domain.domainName },
        "Domain suspended after 14 days unverified"
      );
      continue;
    }

    if (age >= ALERT_THRESHOLD_MS && !doc.domain.alertSentAt) {
      const adminMail = await getAdminMail(doc.tenantId);
      if (!adminMail) continue;

      try {
        await sendDomainAlertEmail({
          to: adminMail,
          storeName: doc.storeName,
          domainName: doc.domain.domainName,
        });
        doc.domain.alertSentAt = new Date();
        await doc.save();
        logger.info(
          { tenantId: doc.tenantId, domain: doc.domain.domainName },
          "Sent 7-day domain verification alert"
        );
      } catch (error) {
        logger.error(
          { err: error, tenantId: doc.tenantId },
          "Failed to send domain alert email"
        );
      }
    }
  }
}
