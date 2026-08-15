export const SEARCH_FILTER_OPTIONS = [
  "price",
  "category",
  "in-stock",
  "rating",
  "brand",
  "color",
  "size",
  "discount",
];

export default function SearchFilterCheckboxes({ selected, onChange }) {
  function toggle(filter) {
    if (selected.includes(filter)) {
      onChange(selected.filter((f) => f !== filter));
    } else {
      onChange([...selected, filter]);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {SEARCH_FILTER_OPTIONS.map((filter) => (
        <label
          key={filter}
          className="glass-input flex items-center gap-2 px-3 py-2 text-sm capitalize"
        >
          <input
            type="checkbox"
            checked={selected.includes(filter)}
            onChange={() => toggle(filter)}
          />
          {filter}
        </label>
      ))}
    </div>
  );
}
