import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import AddProductDialog from "./AddProductDialog";
import { getProducts, deleteProduct } from "../api/adminApi";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(id) {
    setRemovingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-16 pt-6 sm:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Products
        </h1>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          Add product
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-[var(--color-aurora-amber)]">{error}</p>
      )}

      {loading && <p className="text-sm text-[var(--color-ink-dim)]">Loading…</p>}

      {!loading && products.length === 0 && (
        <GlassCard className="text-center text-sm text-[var(--color-ink-dim)]">
          No products yet — add your first one.
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <GlassCard key={product._id} className="flex flex-col gap-3">
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-36 w-full rounded-xl object-cover"
              />
            )}
            <div>
              <p className="font-medium">{product.name}</p>
              <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--color-aurora-cyan)]">
                ₹{product.price?.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--color-ink-dim)]">
                Stock: {product.stockQty ?? 0}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(product._id)}
              disabled={removingId === product._id}
              className="btn-ghost self-start px-4 py-2 text-xs"
            >
              {removingId === product._id ? "Removing…" : "Remove"}
            </button>
          </GlassCard>
        ))}
      </div>

      <AddProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdded={(product) => setProducts((prev) => [product, ...prev])}
      />
    </main>
  );
}
