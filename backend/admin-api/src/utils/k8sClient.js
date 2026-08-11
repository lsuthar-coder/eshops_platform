import * as k8s from "@kubernetes/client-node";
import { logger } from "../utils/logger.js";

/**
 * In-cluster config when this runs as a pod in K3s (the normal case);
 * falls back to the local kubeconfig for running the job against a
 * remote/dev cluster from your machine.
 */
function buildKubeConfig() {
  const kc = new k8s.KubeConfig();
  try {
    kc.loadFromCluster();
  } catch {
    kc.loadFromDefault();
  }
  return kc;
}

const kubeConfig = buildKubeConfig();
const customObjectsApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);

const CERT_MANAGER_GROUP = "cert-manager.io";
const CERT_MANAGER_VERSION = "v1";
const NAMESPACE = process.env.K8S_NAMESPACE || "default";

/**
 * Returns true if the named Certificate resource has condition
 * type=Ready, status=True. Assumes the Jenkins pipeline names the
 * Certificate `tenant-<tenantId>-domain` — must match whatever naming
 * convention the actual Jenkinsfile uses in your cluster; update both
 * together if you change one.
 */
export async function isCertificateReady(tenantId) {
  const certName = `tenant-${tenantId}-domain`;

  try {
    const response = await customObjectsApi.getNamespacedCustomObject(
      CERT_MANAGER_GROUP,
      CERT_MANAGER_VERSION,
      NAMESPACE,
      "certificates",
      certName
    );

    const conditions = response.body?.status?.conditions || [];
    const readyCondition = conditions.find((c) => c.type === "Ready");
    return readyCondition?.status === "True";
  } catch (error) {
    if (error.statusCode === 404) {
      // Certificate resource doesn't exist yet (or was never created) —
      // not ready, but not an error either; the readiness job will
      // just check again next run.
      return false;
    }
    logger.error({ err: error, tenantId }, "Failed to query Certificate status");
    return false;
  }
}
