import GlassCard from "../components/GlassCard";
import StoreFooter from "../components/StoreFooter";
import { useApplyTheme } from "../hooks/useApplyTheme";

function activeMainBanner(config) {
  const banners = config.mainPage?.banners || [];
  return banners.find((b) => b.type === "main" && b.active) || null;
}

export default function HomePage({ config }) {
  useApplyTheme(config);

  const banner = activeMainBanner(config);
  const heroImage = banner?.images?.[0];

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-3">
          {config.logo?.main ? (
            <img src={config.logo.main} alt={config.storeName} className="h-9 w-auto" />
          ) : (
            <span
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {config.storeName}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-16 sm:px-10">
        {heroImage ? (
          <a
            href={heroImage.linkUrl || undefined}
            className="mb-8 block overflow-hidden rounded-3xl"
          >
            <img
              src={heroImage.imageUrl}
              alt=""
              className="h-64 w-full object-cover sm:h-80"
            />
          </a>
        ) : (
          <GlassCard className="mb-8 flex flex-col items-center gap-2 py-16 text-center">
            <h1
              className="text-3xl sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {config.storeName}
            </h1>
            {config.businessDetails?.businessName && (
              <p className="text-sm text-[var(--color-ink-dim)]">
                {config.businessDetails.businessName}
              </p>
            )}
          </GlassCard>
        )}

        {config.gallery?.enabled && config.gallery.images?.length > 0 && (
          <GlassCard className="mb-8">
            <h2
              className="mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {config.gallery.images.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-xl">
                  <img
                    src={img.imageUrl}
                    alt={img.caption || ""}
                    className="h-32 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {config.footer?.socialMedia?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {config.footer.socialMedia.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost px-4 py-2 text-sm"
              >
                {s.text || s.platform}
              </a>
            ))}
          </div>
        )}
      </main>

      <StoreFooter config={config} />
    </div>
  );
}
