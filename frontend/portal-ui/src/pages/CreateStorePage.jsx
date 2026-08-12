import { useState } from "react";
import GlassCard from "../components/GlassCard";
import OtpInput from "../components/OtpInput";
import ResultDialog from "../components/ResultDialog";
import { sendOtp, verifyOtp, createStore } from "../api/portalApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateStorePage() {
  const [form, setForm] = useState({
    store_name: "",
    name: "",
    mail: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mailVerified, setMailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState("");

  const mailValid = EMAIL_RE.test(form.mail);
  const formComplete =
    form.store_name.trim() &&
    form.name.trim() &&
    mailValid &&
    form.password.length >= 8;
  const canSubmit = formComplete && mailVerified && !loading;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Editing the mail after verification invalidates it — must re-verify.
    if (field === "mail") {
      setMailVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  }

  async function handleSendOtp() {
    if (!mailValid) return;
    setOtpError("");
    setSendingOtp(true);
    try {
      await sendOtp(form.mail);
      setOtpSent(true);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) return;
    setOtpError("");
    setVerifyingOtp(true);
    try {
      await verifyOtp(form.mail, otp);
      setMailVerified(true);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setDialogOpen(true);
    setLoading(true);
    setResult(null);
    setResultError("");

    try {
      const data = await createStore(form);
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
          Create your store
        </h1>
        <p className="mt-2 text-[var(--color-ink-dim)]">
          Four details, one verification, and your store is live.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Store name">
            <input
              value={form.store_name}
              onChange={(e) => updateField("store_name", e.target.value)}
              placeholder="Leela Store"
              className="glass-input w-full px-4 py-3"
              required
            />
          </Field>

          <Field label="Your name">
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Leeladhar Suthar"
              className="glass-input w-full px-4 py-3"
              required
            />
          </Field>

          <Field label="Admin mail">
            <div className="flex gap-2">
              <input
                type="email"
                value={form.mail}
                onChange={(e) => updateField("mail", e.target.value)}
                placeholder="you@example.com"
                className="glass-input w-full px-4 py-3"
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!mailValid || sendingOtp || mailVerified}
                className="btn-ghost shrink-0 whitespace-nowrap px-4 text-sm"
              >
                {mailVerified
                  ? "Verified"
                  : sendingOtp
                  ? "Sending…"
                  : otpSent
                  ? "Resend"
                  : "Send code"}
              </button>
            </div>
          </Field>

          {otpSent && !mailVerified && (
            <Field label="Enter the 6-digit code">
              <div className="flex items-center gap-3">
                <OtpInput value={otp} onChange={setOtp} disabled={verifyingOtp} />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || verifyingOtp}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {verifyingOtp ? "Verifying…" : "Verify"}
                </button>
              </div>
            </Field>
          )}

          {mailVerified && (
            <p className="text-sm text-[var(--color-aurora-cyan)]">
              Mail verified
            </p>
          )}

          {otpError && (
            <p className="text-sm text-[var(--color-aurora-amber)]">{otpError}</p>
          )}

          <Field label="Admin password">
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="At least 8 characters"
              className="glass-input w-full px-4 py-3"
              required
            />
          </Field>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary mt-2 py-3"
          >
            {loading ? "Creating…" : "Create store"}
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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-[var(--color-ink-dim)]">{label}</span>
      {children}
    </label>
  );
}
