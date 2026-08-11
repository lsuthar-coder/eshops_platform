import { useState } from "react";
import Dialog from "../components/Dialog";
import { addProduct } from "../api/adminApi";
import { uploadToCloudinary } from "../hooks/useCloudinaryUpload";

export default function AddProductDialog({ open, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQty: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setForm({ name: "", description: "", price: "", stockQty: "" });
    setImageFile(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let images = [];
      if (imageFile) {
        const url = await uploadToCloudinary(imageFile, "products");
        images = [url];
      }

      const product = await addProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stockQty: Number(form.stockQty) || 0,
        images,
      });

      onAdded(product);
      reset();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add product">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[var(--color-ink-dim)]">Name</span>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="glass-input px-4 py-3"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[var(--color-ink-dim)]">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="glass-input px-4 py-3"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-2 text-sm">
            <span className="text-[var(--color-ink-dim)]">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="glass-input px-4 py-3"
              required
            />
          </label>

          <label className="flex flex-1 flex-col gap-2 text-sm">
            <span className="text-[var(--color-ink-dim)]">Stock qty</span>
            <input
              type="number"
              min="0"
              value={form.stockQty}
              onChange={(e) => update("stockQty", e.target.value)}
              className="glass-input px-4 py-3"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-[var(--color-ink-dim)]">Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="glass-input px-4 py-3 text-sm"
          />
        </label>

        {error && (
          <p className="text-sm text-[var(--color-aurora-amber)]">{error}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary mt-2 py-3">
          {saving ? "Saving…" : "Add product"}
        </button>
      </form>
    </Dialog>
  );
}
