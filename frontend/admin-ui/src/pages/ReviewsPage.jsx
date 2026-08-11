import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { getReviews, getProducts } from "../api/adminApi";

function Stars({ rating }) {
  return (
    <span style={{ color: "var(--color-aurora-amber)" }}>
      {"★".repeat(rating)}
      <span style={{ color: "var(--color-glass-border)" }}>
        {"★".repeat(5 - rating)}
      </span>
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {});
  }, []);

  async function load(productId) {
    setLoading(true);
    setError("");
    try {
      const data = await getReviews(productId || undefined);
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(productFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilter]);

  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-6 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Reviews
        </h1>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="glass-input px-3 py-2 text-sm"
        >
          <option value="" style={{ background: "#10152a" }}>
            All products
          </option>
          {products.map((p) => (
            <option key={p._id} value={p._id} style={{ background: "#10152a" }}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 text-sm text-[var(--color-aurora-amber)]">{error}</p>
      )}

      {loading && <p className="text-sm text-[var(--color-ink-dim)]">Loading…</p>}

      {!loading && reviews.length === 0 && (
        <GlassCard className="text-center text-sm text-[var(--color-ink-dim)]">
          No reviews yet.
        </GlassCard>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <GlassCard key={review._id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              <span className="text-xs text-[var(--color-ink-dim)]">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm font-medium">{review.authorName}</p>
            {review.comment && (
              <p className="text-sm text-[var(--color-ink-dim)]">{review.comment}</p>
            )}
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
