import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { getOrders, updateOrderStatus } from "../api/adminApi";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const STATUS_COLOR = {
  pending: "#9aa2ba",
  paid: "#35e0c7",
  shipped: "#ffb877",
  delivered: "#7c6cfd",
  cancelled: "#ff7a7a",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-16 pt-6 sm:px-10">
      <h1
        className="mb-6 text-3xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        Orders
      </h1>

      {error && (
        <p className="mb-4 text-sm text-[var(--color-aurora-amber)]">{error}</p>
      )}

      {loading && (
        <p className="text-sm text-[var(--color-ink-dim)]">Loading…</p>
      )}

      {!loading && orders.length === 0 && (
        <GlassCard className="text-center text-sm text-[var(--color-ink-dim)]">
          No orders yet.
        </GlassCard>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <GlassCard key={order._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--color-ink-dim)]">
                #{order._id.slice(-8)}
              </p>
              <p className="text-sm">
                {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"} ·{" "}
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  ₹{order.total?.toFixed(2)}
                </span>
              </p>
              {order.customerEmail && (
                <p className="text-xs text-[var(--color-ink-dim)]">{order.customerEmail}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className="status-dot"
                style={{ background: STATUS_COLOR[order.status] }}
              />
              <select
                value={order.status}
                disabled={updatingId === order._id}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} style={{ background: "#10152a" }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
