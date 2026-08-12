import { useState } from "react";
import GlassCard from "../components/GlassCard";
import ResultDialog from "../components/ResultDialog";
import { getStatusByMail } from "../api/portalApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckStatusPage() {
  const [mail, setMail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState("");

  const mailValid = EMAIL_RE.test(mail);

  async function handleCheck(event) {
    event.preventDefault();
    if (!mailValid) return;

    setDialogOpen(true);
    setLoading(true);
    setResult(null);
    setResultError("");

    try {
      const data = await getStatusByMail(mail);
      setResult(data);
    } catch (err) {
      setResultError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-lg px-6 pb-16 pt-6 sm:px-10">
      <div className="mb-8">
        <h1
          className="text-3xl sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Check status
        </h1>
        <p className="mt-2 text-[var(--color-ink-dim)]">
          Look your store up by the mail you signed up with.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleCheck} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--color-ink-dim)]">Admin mail</span>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="you@example.com"
              className="glass-input w-full px-4 py-3"
              required
            />
          </label>

          <button
            type="submit"
            disabled={!mailValid || loading}
            className="btn-primary mt-2 py-3"
          >
            {loading ? "Looking up…" : "Check status"}
          </button>
        </form>
      </GlassCard>

      <ResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        loading={loading}
        data={result}
        error={resultError}
      />
    </main>
  );
}
