import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import RepeatableList from "../components/RepeatableList";
import DomainSection from "./DomainSection";
import SearchFilterCheckboxes from "../components/SearchFilterCheckboxes";
import GalleryImagesEditor from "../components/GalleryImagesEditor";

const FONT_OPTIONS = ["Inter", "Roboto", "Open Sans", "Poppins", "Montserrat"];
const SOCIAL_PLATFORM_OPTIONS = [
  "Instagram",
  "Facebook",
  "Twitter/X",
  "YouTube",
  "LinkedIn",
  "TikTok",
  "Pinterest",
  "WhatsApp",
];
import {
  getConfig,
  updateConfig,
  updateFavicon,
  updateLogo,
  getPaymentSettings,
  updatePaymentSettings,
} from "../api/adminApi";
import { uploadToCloudinary } from "../hooks/useCloudinaryUpload";

function Section({ title, children, onSave, saving, saved }) {
  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-primary px-4 py-2 text-xs"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </div>
      {children}
    </GlassCard>
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

async function saveSection(setSaving, setSavedFlag, fn) {
  setSaving(true);
  try {
    await fn();
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2000);
  } finally {
    setSaving(false);
  }
}

export default function MainPage() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  const [paymentSettings, setPaymentSettings] = useState([]);
  const [stripeKey, setStripeKey] = useState("");
  const [razorpayKey, setRazorpayKey] = useState("");

  useEffect(() => {
    getConfig().then(setConfig).catch((err) => setError(err.message));
    getPaymentSettings().then(setPaymentSettings).catch(() => {});
  }, []);

  function isSaving(key) {
    return Boolean(saving[key]);
  }
  function setSectionSaving(key, value) {
    setSaving((prev) => ({ ...prev, [key]: value }));
  }
  function setSectionSaved(key, value) {
    setSaved((prev) => ({ ...prev, [key]: value }));
  }

  function patchField(path, value) {
    setConfig((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        // Older tenant documents (created before some config sections
        // existed, or via an upsert that only set a few top-level
        // fields) can be missing whole nested objects — create them on
        // the way down instead of crashing on `undefined.foo = ...`.
        if (obj[keys[i]] == null || typeof obj[keys[i]] !== "object") {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function save(key, patch) {
    await saveSection(
      (v) => setSectionSaving(key, v),
      (v) => setSectionSaved(key, v),
      async () => {
        const updated = await updateConfig(patch);
        setConfig(updated);
      }
    );
  }

  async function handleFaviconUpload(file) {
    const url = await uploadToCloudinary(file, "favicon");
    await updateFavicon(url);
    patchField("favicon", url);
  }

  async function handleLogoUpload(file, slot) {
    const url = await uploadToCloudinary(file, "logo");
    await updateLogo({ [slot]: url });
    patchField(`logo.${slot}`, url);
  }

  async function handlePaymentSave(provider, key) {
    if (!key) return;
    const result = await updatePaymentSettings(provider, key);
    setPaymentSettings((prev) => [
      ...prev.filter((p) => p.provider !== provider),
      result,
    ]);
  }

  if (error) {
    return (
      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-6 sm:px-10">
        <p className="text-sm text-[var(--color-aurora-amber)]">{error}</p>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-6 sm:px-10">
        <p className="text-sm text-[var(--color-ink-dim)]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-6 sm:px-10">
      <h1
        className="mb-6 text-3xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        Store settings
      </h1>

      <div className="flex flex-col gap-5">
        {/* Domain */}
        <DomainSection />

        {/* Theme */}
        <Section
          title="Theme"
          saving={isSaving("theme")}
          saved={saved.theme}
          onSave={() => save("theme", { theme: config.theme })}
        >
          <div className="grid grid-cols-3 gap-3">
            {["primaryColor", "secondaryColor", "tertiaryColor"].map((key) => (
              <Field key={key} label={key.replace("Color", "")}>
                <input
                  type="color"
                  value={config.theme?.[key] || "#7c6cfd"}
                  onChange={(e) => patchField(`theme.${key}`, e.target.value)}
                  className="glass-input h-11 w-full cursor-pointer px-2"
                />
              </Field>
            ))}
          </div>
          <Field label="Font family">
            <select
              value={config.theme?.fontFamily || ""}
              onChange={(e) => patchField("theme.fontFamily", e.target.value)}
              className="glass-input px-4 py-3"
            >
              <option value="" style={{ background: "#10152a" }}>
                Select a font…
              </option>
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font} style={{ background: "#10152a" }}>
                  {font}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.theme?.lightDarkModeEnabled || false}
              onChange={(e) =>
                patchField("theme.lightDarkModeEnabled", e.target.checked)
              }
            />
            <span className="text-[var(--color-ink-dim)]">
              Let shoppers switch between light and dark mode
            </span>
          </label>
        </Section>

        {/* Branding */}
        <GlassCard className="flex flex-col gap-4">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            Branding
          </h2>
          <Field label="Favicon">
            {config.favicon && (
              <img src={config.favicon} alt="Favicon" className="h-8 w-8 rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFaviconUpload(e.target.files[0])}
              className="glass-input px-4 py-3 text-sm"
            />
          </Field>
          <Field label="Logo (main)">
            {config.logo?.main && (
              <img src={config.logo.main} alt="Logo" className="h-10 w-auto rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "main")}
              className="glass-input px-4 py-3 text-sm"
            />
          </Field>
          <Field label="Logo (small)">
            {config.logo?.small && (
              <img src={config.logo.small} alt="Small logo" className="h-8 w-auto rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "small")}
              className="glass-input px-4 py-3 text-sm"
            />
          </Field>
        </GlassCard>

        {/* Business details */}
        <Section
          title="Business details"
          saving={isSaving("business")}
          saved={saved.business}
          onSave={() => save("business", { businessDetails: config.businessDetails })}
        >
          {["businessName", "businessEmail", "businessPhone", "businessAddress", "gstNumber"].map(
            (key) => (
              <Field key={key} label={key.replace("business", "").replace(/^./, (c) => c.toUpperCase()) || "GST number"}>
                <input
                  value={config.businessDetails?.[key] || ""}
                  onChange={(e) => patchField(`businessDetails.${key}`, e.target.value)}
                  className="glass-input px-4 py-3"
                />
              </Field>
            )
          )}
        </Section>

        {/* Customer support */}
        <Section
          title="Customer support"
          saving={isSaving("support")}
          saved={saved.support}
          onSave={() => save("support", { customerSupport: config.customerSupport })}
        >
          <Field label="Support email">
            <input
              value={config.customerSupport?.email || ""}
              onChange={(e) => patchField("customerSupport.email", e.target.value)}
              className="glass-input px-4 py-3"
            />
          </Field>
          <Field label="Support phone">
            <input
              value={config.customerSupport?.phone || ""}
              onChange={(e) => patchField("customerSupport.phone", e.target.value)}
              className="glass-input px-4 py-3"
            />
          </Field>
        </Section>

        {/* Footer */}
        <Section
          title="Footer"
          saving={isSaving("footer")}
          saved={saved.footer}
          onSave={() => save("footer", { footer: config.footer })}
        >
          <Field label="Links">
            <RepeatableList
              items={config.footer?.links || []}
              onChange={(v) => patchField("footer.links", v)}
              fields={[
                { key: "name", placeholder: "Name (e.g. About us)" },
                { key: "url", placeholder: "/about" },
              ]}
              addLabel="Add link"
            />
          </Field>
          <Field label="Social media">
            <RepeatableList
              items={config.footer?.socialMedia || []}
              onChange={(v) => patchField("footer.socialMedia", v)}
              fields={[
                {
                  key: "platform",
                  type: "select",
                  placeholder: "Choose platform",
                  options: SOCIAL_PLATFORM_OPTIONS,
                },
                { key: "url", placeholder: "https://instagram.com/..." },
                { key: "text", placeholder: "Follow us" },
              ]}
              addLabel="Add social link"
            />
          </Field>
        </Section>

        {/* Payment gateways */}
        <GlassCard className="flex flex-col gap-4">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            Payment gateways
          </h2>
          <p className="text-xs text-[var(--color-ink-dim)]">
            Keys are encrypted and stored separately — never shown again after saving.
          </p>

          {["stripe", "razorpay"].map((provider) => {
            const existing = paymentSettings.find((p) => p.provider === provider);
            return (
              <div key={provider} className="glass-input flex items-center gap-3 p-3">
                <span className="w-24 text-sm capitalize">{provider}</span>
                <input
                  type="password"
                  placeholder={existing ? existing.keyPreview : "API key"}
                  value={provider === "stripe" ? stripeKey : razorpayKey}
                  onChange={(e) =>
                    provider === "stripe"
                      ? setStripeKey(e.target.value)
                      : setRazorpayKey(e.target.value)
                  }
                  className="glass-input min-w-0 flex-1 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentSave(
                      provider,
                      provider === "stripe" ? stripeKey : razorpayKey
                    )
                  }
                  className="btn-ghost px-3 py-2 text-xs"
                >
                  {existing ? "Update" : "Connect"}
                </button>
              </div>
            );
          })}
        </GlassCard>

        {/* Search filters */}
        <Section
          title="Search filters"
          saving={isSaving("search")}
          saved={saved.search}
          onSave={() => save("search", { searchPage: config.searchPage })}
        >
          <SearchFilterCheckboxes
            selected={config.searchPage?.enabledFilters || []}
            onChange={(v) => patchField("searchPage.enabledFilters", v)}
          />
        </Section>

        {/* Gallery */}
        <Section
          title="Gallery"
          saving={isSaving("gallery")}
          saved={saved.gallery}
          onSave={() => save("gallery", { gallery: config.gallery })}
        >
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.gallery?.enabled || false}
              onChange={(e) => patchField("gallery.enabled", e.target.checked)}
            />
            <span className="text-[var(--color-ink-dim)]">Show gallery page</span>
          </label>
          <GalleryImagesEditor
            images={config.gallery?.images || []}
            onChange={(v) => patchField("gallery.images", v)}
          />
        </Section>
      </div>
    </main>
  );
}
