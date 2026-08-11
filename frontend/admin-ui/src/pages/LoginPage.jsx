import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(mail, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Admin login
        </h1>
        <p className="mt-2 text-[var(--color-ink-dim)]">
          Sign in to manage your store.
        </p>
      </div>

      <GlassCard className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--color-ink-dim)]">Admin mail</span>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className="glass-input w-full px-4 py-3"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--color-ink-dim)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full px-4 py-3"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-[var(--color-aurora-amber)]">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-2 py-3">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </GlassCard>
    </main>
  );
}
