/**
 * Generic add/remove list editor for the config object's repeated array
 * fields (footer links, social media, banners, search filters, pages).
 * One reusable pattern instead of a bespoke component per array —
 * `fields` describes the inputs for a single row. Each field is a text
 * input by default; pass `type: "select"` + `options` for a dropdown.
 */
export default function RepeatableList({ items, onChange, fields, addLabel }) {
  function updateItem(index, key, value) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    const blank = Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]));
    onChange([...items, blank]);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="glass-input flex flex-wrap items-center gap-2 p-3"
        >
          {fields.map((field) =>
            field.type === "select" ? (
              <select
                key={field.key}
                value={item[field.key] ?? ""}
                onChange={(e) => updateItem(index, field.key, e.target.value)}
                className="glass-input min-w-0 flex-1 px-3 py-2 text-sm"
              >
                <option value="" style={{ background: "#10152a" }}>
                  {field.placeholder || "Select…"}
                </option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#10152a" }}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={field.key}
                value={item[field.key] ?? ""}
                onChange={(e) => updateItem(index, field.key, e.target.value)}
                placeholder={field.placeholder}
                className="glass-input min-w-0 flex-1 px-3 py-2 text-sm"
              />
            )
          )}
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="btn-ghost shrink-0 px-3 py-2 text-xs"
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addItem} className="btn-ghost self-start px-4 py-2 text-sm">
        {addLabel || "Add"}
      </button>
    </div>
  );
}
