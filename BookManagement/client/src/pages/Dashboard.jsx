import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(n || 0)
  );

const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    Promise.all([
      axios.get(`https://bookstore-c1tt.onrender.com/api/books`),
      axios.get(`https://bookstore-c1tt.onrender.com/api/orders`),
      axios.get(`https://bookstore-c1tt.onrender.com/api/customers`),
    ])
      .then(([b, o, c]) => {
        if (!isMounted) return;
        setBooks(Array.isArray(b.data) ? b.data : []);
        setOrders(Array.isArray(o.data) ? o.data : []);
        setCustomers(Array.isArray(c.data) ? c.data : []);
      })
      .catch((e) => setError(e.message || "Failed to load data"))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  // Soft entrance animation when data is ready
  useEffect(() => {
    if (!loading && !error) {
      const id = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(id);
    }
    setVisible(false);
  }, [loading, error]);

  // Reusable count-up hook for metric numbers
  function useCountUp(target, durationMs = 900) {
    const [value, setValue] = useState(0);
    useEffect(() => {
      let rafId;
      const start = performance.now();
      const from = 0;
      const to = Number(target) || 0;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setValue(Math.round(from + (to - from) * eased));
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, [target, durationMs]);
    return value;
  }

  const metrics = useMemo(() => {
    const totalSales = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0
    );
    const booksInStock = books.reduce(
      (sum, b) => sum + Number(b.stock || 0),
      0
    );
    const startOfToday = getStartOfToday();
    const ordersToday = orders.filter(
      (o) => new Date(o.createdAt) >= startOfToday
    ).length;
    const customersCount = customers.length;
    return { totalSales, booksInStock, ordersToday, customersCount };
  }, [books, orders, customers]);

  // Animated metric values
  const animTotalSales = useCountUp(metrics.totalSales, 900);
  const animBooksInStock = useCountUp(metrics.booksInStock, 900);
  const animOrdersToday = useCountUp(metrics.ordersToday, 900);
  const animCustomersCount = useCountUp(metrics.customersCount, 900);

  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted.slice(0, 5);
  }, [orders]);

  const topSellingBooks = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      for (const it of o.items || []) {
        if (it && it.title && !it.isCombo) {
          const prev = map.get(it.title) || 0;
          map.set(it.title, prev + Math.max(1, Number(it.quantity || 1)));
        }
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, qty]) => ({ title, qty }));
  }, [orders]);

  return (
    <div className="p-2 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 flex items-center gap-2">
        📊 Dashboard
      </h2>

      {loading && (
        <div className="bg-white shadow rounded-xl p-4">
          Loading dashboard...
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div
              className={`bg-white shadow rounded-xl p-4 transform transition duration-700 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: "50ms" }}
            >
              <h3 className="text-gray-500 text-sm">Total Sales</h3>
              <p className="text-2xl font-bold text-green-600">
                {currency(animTotalSales)}
              </p>
            </div>
            <div
              className={`bg-white shadow rounded-xl p-4 transform transition duration-700 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <h3 className="text-gray-500 text-sm">Books in Stock</h3>
              <p className="text-2xl font-bold text-blue-600">
                {animBooksInStock}
              </p>
            </div>
            <div
              className={`bg-white shadow rounded-xl p-4 transform transition duration-700 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: "250ms" }}
            >
              <h3 className="text-gray-500 text-sm">Orders Today</h3>
              <p className="text-2xl font-bold text-purple-600">
                {animOrdersToday}
              </p>
            </div>
            <div
              className={`bg-white shadow rounded-xl p-4 transform transition duration-700 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: "350ms" }}
            >
              <h3 className="text-gray-500 text-sm">Customers</h3>
              <p className="text-2xl font-bold text-orange-600">
                {animCustomersCount}
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
            <h3 className="text-lg font-semibold mb-4">🛒 Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-medium">
                    <th className="p-3 border">Order ID</th>
                    <th className="p-3 border">Customer</th>
                    <th className="p-3 border">Total</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-4 text-center text-gray-500 border"
                      >
                        No orders yet.
                      </td>
                    </tr>
                  )}
                  {recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="p-3 border">{o._id?.slice(-6)}</td>
                      <td className="p-3 border">{o.customer?.name || "-"}</td>
                      <td className="p-3 border">{currency(o.totalAmount)}</td>
                      <td className="p-3 border capitalize">
                        <span
                          className={
                            o.status === "completed"
                              ? "text-green-600 font-semibold"
                              : o.status === "pending"
                              ? "text-yellow-600 font-semibold"
                              : o.status === "cancelled"
                              ? "text-red-600 font-semibold"
                              : "text-slate-700"
                          }
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 border">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-4 lg:p-6">
            <h3 className="text-lg font-semibold mb-4">📚 Top Selling Books</h3>
            {topSellingBooks.length === 0 ? (
              <p className="text-slate-500">No sales data yet.</p>
            ) : (
              <ul className="space-y-3">
                {topSellingBooks.map((b) => (
                  <li
                    key={b.title}
                    className="flex justify-between border-b pb-2"
                  >
                    <span>{b.title}</span>
                    <span className="font-bold text-green-600">
                      {b.qty} sold
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
