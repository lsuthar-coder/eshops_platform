import GlassCard from "../components/GlassCard";

export default function AnalyticsPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-6 sm:px-10">
      <h1
        className="mb-6 text-3xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        Analytics
      </h1>
      <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
        <p
          className="text-xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Soon live
        </p>
        <p className="text-sm text-[var(--color-ink-dim)]">
          Sales, traffic, and product performance graphs will show up here.
        </p>
      </GlassCard>
    </main>
  );
}
