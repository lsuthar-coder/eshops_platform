export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto px-6 py-8 sm:px-10">
      <div className="glass-panel flex flex-col items-center justify-between gap-3 px-6 py-4 text-sm sm:flex-row">
        <p className="text-[var(--color-ink-dim)]">
          Built by <span className="text-[var(--color-ink)]">Leeladhar Suthar</span>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://portfolio.lsuthar.in"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-aurora-cyan)]"
          >
            Portfolio
          </a>
          <a
            href="https://github.com/lsuthar-coder"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-aurora-cyan)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
