export default function Dialog({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="glass-panel w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-lg"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {title}
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
        {children}
      </div>
    </div>
  );
}
