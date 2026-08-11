import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { to: "/", label: "Main", end: true },
  { to: "/analytics", label: "Analytics" },
  { to: "/orders", label: "Orders" },
  { to: "/products", label: "Products" },
  { to: "/reviews", label: "Reviews" },
];

const linkClass = ({ isActive }) =>
  [
    "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
    isActive
      ? "bg-white/10 text-[var(--color-ink)] border border-[var(--color-glass-border)]"
      : "text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]",
  ].join(" ");

export default function NavBar() {
  const { admin, logout } = useAuth();

  return (
    <header className="relative z-10 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <div className="flex items-center justify-between sm:justify-start sm:gap-8">
        <div
          className="text-lg tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {admin?.storeName || "Storeforge Admin"}
        </div>
      </div>

      <nav
        className="glass-panel flex items-center gap-1 overflow-x-auto p-1"
        style={{ borderRadius: 9999 }}
      >
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={linkClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" onClick={logout} className="btn-ghost self-start px-4 py-2 text-sm sm:self-auto">
        Log out
      </button>
    </header>
  );
}
