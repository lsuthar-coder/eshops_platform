export default function LoaderScreen() {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="liquid-loader" aria-hidden="true">
        <div className="liquid-loader__wave" />
      </div>
      <p className="text-sm text-[var(--color-ink-dim)]">Loading store…</p>
    </div>
  );
}
