function CopyableUrl({ label, url }) {
  return (
    <div className="glass-input flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-ink-dim)]">{label}</p>
        <p
          className="truncate text-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {url}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(url)}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          Copy
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn-primary px-3 py-1.5 text-xs"
        >
          Open
        </a>
      </div>
    </div>
  );
}

/**
 * Shows the result of a single request — no polling. Store creation and
 * status lookups both resolve synchronously now (the wildcard Ingress
 * already covers every tenant subdomain, so there's nothing async left
 * to wait on), so this just renders whatever came back: loading while
 * the request is in flight, then a success or failure state.
 */
export default function ResultDialog({ open, onClose, loading, data, error }) {
  if (!open) return null;

  const status = data?.status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Store status"
    >
      <div className="glass-panel w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-lg"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {loading
              ? "One moment"
              : status === "live"
              ? "Your store is live"
              : status === "failed"
              ? "Something went wrong"
              : "Store status"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-ink)]"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="liquid-loader" aria-hidden="true">
              <div className="liquid-loader__wave" />
            </div>
            <p className="text-sm text-[var(--color-ink-dim)]">
              Setting things up — this only takes a second.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-[var(--color-ink-dim)]">{error}</p>
            <button type="button" onClick={onClose} className="btn-ghost mt-2 py-2.5">
              Close
            </button>
          </div>
        )}

        {!loading && !error && status === "live" && data && (
          <div className="flex flex-col gap-3">
            <CopyableUrl label="Store URL" url={data.storeUrl} />

            <a
              href={data.adminPortalUrl}
              className="btn-primary mt-1 py-3 text-center"
            >
              Login to admin portal
            </a>

            <button type="button" onClick={onClose} className="btn-ghost py-2.5">
              Done
            </button>
          </div>
        )}

        {!loading && !error && status === "failed" && (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-[var(--color-ink-dim)]">
              Setting up your store didn't complete. Nothing was charged —
              you can try again.
            </p>
            <button type="button" onClick={onClose} className="btn-ghost mt-2 py-2.5">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
