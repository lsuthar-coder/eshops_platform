import GlassCard from "./GlassCard";

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || null;

export default function StoreNotFound() {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
      <GlassCard className="max-w-sm text-center">
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Store not found
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-dim)]">
          There's no store at this address. It may have been removed, or
          the link might be incorrect.
        </p>
        {PORTAL_URL && (
          <a
            href={PORTAL_URL}
            className="btn-primary mt-6 inline-block px-5 py-2.5 text-sm"
          >
            Create your own store
          </a>
        )}
      </GlassCard>
    </div>
  );
}
