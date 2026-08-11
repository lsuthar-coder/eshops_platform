import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  [
    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
    isActive
      ? "bg-white/10 text-[var(--color-ink)] border border-[var(--color-glass-border)]"
      : "text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]",
  ].join(" ");

export default function NavBar() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
      <div
        className="text-lg tracking-tight"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        Storeforge
      </div>
      <nav className="glass-panel flex items-center gap-1 p-1" style={{ borderRadius: 9999 }}>
        <NavLink to="/" end className={linkClass}>
          Create store
        </NavLink>
        <NavLink to="/status" className={linkClass}>
          Check status
        </NavLink>
      </nav>
    </header>
  );
}
