import { useState } from "react";
import { uploadToCloudinary } from "../hooks/useCloudinaryUpload";

export default function GalleryImagesEditor({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file, "gallery");
      onChange([...images, { imageUrl: url, caption: "" }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function updateCaption(index, caption) {
    const next = [...images];
    next[index] = { ...next[index], caption };
    onChange(next);
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, index) => (
          <div key={index} className="glass-input flex flex-col gap-2 p-2">
            <img
              src={img.imageUrl}
              alt={img.caption || ""}
              className="h-24 w-full rounded-lg object-cover"
            />
            <input
              value={img.caption || ""}
              onChange={(e) => updateCaption(index, e.target.value)}
              placeholder="Caption"
              className="glass-input px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="btn-ghost px-2 py-1.5 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <label className="btn-ghost inline-flex w-fit cursor-pointer items-center px-4 py-2 text-sm">
        {uploading ? "Uploading…" : "Add image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {error && (
        <p className="text-sm text-[var(--color-aurora-amber)]">{error}</p>
      )}
    </div>
  );
}
