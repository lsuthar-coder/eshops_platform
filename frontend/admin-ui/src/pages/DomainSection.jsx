import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { getDomainStatus, submitDomain as submitDomainRequest } from "../api/adminApi";

const STATUS_META = {
  pending: { label: "Pending verification", color: "#ffb877" },
  verified: { label: "Verified", color: "#35e0c7" },
  rejected: { label: "Setup failed", color: "#ff7a7a" },
  suspended: { label: "Suspended", color: "#ff7a7a" },
};

export default function DomainSection() {
  const [status, setStatus] = useState(null);
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getDomainStatus();
      setStatus(data);
      setDomainInput(data.domainName || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!domainInput.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await submitDomainRequest(domainInput.trim());
      await load(); // refresh to show the new pending status + instructions
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const meta = status?.status ? STATUS_META[status.status] : null;
  const showInstructions = status?.status === "pending" || status?.status === "rejected";

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Domain
        </h2>
        {meta && (
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
            style={{ borderColor: "var(--color-glass-border)", color: meta.color }}
          >
            <span className="status-dot" style={{ background: meta.color }} />
            {meta.label}
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-[var(--color-ink-dim)]">Loading…</p>}

      {!loading && (
        <>
          {status?.generatedUrl && (
            <p className="text-xs text-[var(--color-ink-dim)]">
              Your store is always reachable at{" "}
              <a
                href={status.generatedUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: "var(--font-mono)" }}
                className="text-[var(--color-aurora-cyan)]"
              >
                {status.generatedUrl}
              </a>{" "}
              — a custom domain below is optional and doesn't replace it.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="www.yourstore.com"
              className="glass-input flex-1 px-4 py-3"
            />
            <button
              type="submit"
              disabled={submitting || !domainInput.trim()}
              className="btn-primary shrink-0 px-4 py-3 text-sm"
            >
              {submitting ? "Submitting…" : status?.domainName ? "Update" : "Connect"}
            </button>
          </form>

          {error && (
            <p className="text-sm text-[var(--color-aurora-amber)]">{error}</p>
          )}

          {status?.status === "suspended" && (
            <p className="text-sm text-[var(--color-aurora-amber)]">
              This domain was suspended after 14 days without successful
              verification. Your store kept running the whole time at the
              generated URL above. Submit again once your DNS record is
              correctly in place.
            </p>
          )}

          {showInstructions && status && (
            <div className="glass-input flex flex-col gap-2 p-4">
              <p className="text-xs font-medium text-[var(--color-ink-dim)]">
                DNS setup steps
              </p>
              <ol className="flex flex-col gap-1.5 text-sm">
                {status.instructions?.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--color-aurora-cyan)]">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p
                className="mt-1 text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Target IP: <span className="text-[var(--color-aurora-cyan)]">{status.targetIp}</span>
              </p>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}
