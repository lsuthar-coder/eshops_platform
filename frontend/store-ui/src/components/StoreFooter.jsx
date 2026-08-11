const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_PORTAL_URL || "#";

export default function StoreFooter({ config }) {
  const customDomain =
    config.domain?.status === "verified" ? config.domain.domainName : null;

  return (
    <footer className="relative z-10 mt-auto px-6 py-8 sm:px-10">
      {(config.businessDetails?.businessName || config.customerSupport?.email) && (
        <div className="glass-panel mb-4 flex flex-col gap-2 px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {config.businessDetails?.businessName && (
              <p className="font-medium">{config.businessDetails.businessName}</p>
            )}
            {config.businessDetails?.businessAddress && (
              <p className="text-xs text-[var(--color-ink-dim)]">
                {config.businessDetails.businessAddress}
              </p>
            )}
          </div>
          {config.customerSupport?.email && (
            <a
              href={`mailto:${config.customerSupport.email}`}
              className="text-xs text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-aurora-cyan)]"
            >
              {config.customerSupport.email}
            </a>
          )}
        </div>
      )}

      <div className="glass-panel flex flex-col gap-3 px-6 py-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-[var(--color-ink-dim)] sm:flex-row sm:gap-4">
          <span>
            Store URL:{" "}
            <a
              href={config.generatedUrl}
              style={{ fontFamily: "var(--font-mono)" }}
              className="text-[var(--color-aurora-cyan)]"
            >
              {config.generatedUrl}
            </a>
          </span>
          {customDomain && (
            <span>
              Custom domain:{" "}
              <a
                href={`https://${customDomain}`}
                style={{ fontFamily: "var(--font-mono)" }}
                className="text-[var(--color-aurora-cyan)]"
              >
                {customDomain}
              </a>
            </span>
          )}
        </div>

        <a
          href={ADMIN_PORTAL_URL}
          className="text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-aurora-cyan)]"
        >
          Store owner? Manage this store →
        </a>
      </div>
    </footer>
  );
}
