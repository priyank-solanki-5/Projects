import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showExchange, setShowExchange] = useState(false);
  const [exchangeOrder, setExchangeOrder] = useState(null);
  const [books, setBooks] = useState([]);
  const [fromBookId, setFromBookId] = useState("");
  const [toBookId, setToBookId] = useState("");
  const [exchangeQty, setExchangeQty] = useState(1);
  const [exchanging, setExchanging] = useState(false);
  const [exchangeError, setExchangeError] = useState("");

  useEffect(() => {
    // try backend first
    axios
      .get(`https://bookstore-c1tt.onrender.com/api/orders`)
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.warn(
          "Failed to load orders from backend, falling back to localStorage",
          err.message
        );
        const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        setOrders(savedOrders);
      });
  }, []);

  // load books for exchange when modal opens
  useEffect(() => {
    if (!showExchange) return;
    axios
      .get(`https://bookstore-c1tt.onrender.com/api/books`)
      .then((res) => setBooks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBooks([]));
  }, [showExchange]);

  // Save updated orders to localStorage
  const saveOrders = (updatedOrders) => {
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  // Handle status change - update backend if available
  const handleStatusChange = (id, newStatus) => {
    // optimistic UI update
    const updatedOrders = orders.map((order) =>
      order._id === id || order.id === id
        ? { ...order, status: newStatus }
        : order
    );
    setOrders(updatedOrders);

    // attempt backend update
    axios
      .put(`https://bookstore-c1tt.onrender.com/api/orders/${id}`, {
        status: newStatus,
      })
      .then((res) => {
        // replace with server response if present
        const serverOrder = res.data;
        setOrders((prev) =>
          prev.map((o) =>
            o._id === serverOrder._id || o.id === serverOrder._id
              ? serverOrder
              : o
          )
        );
      })
      .catch((err) => {
        console.warn("Failed to update order status on backend", err.message);
        // also persist locally
        saveOrders(updatedOrders);
      });
  };

  // Handle exchange / return
  const handleAction = (id, type) => {
    const payload = {};
    if (type === "Exchange") {
      // open exchange modal instead of immediate update
      const ord = orders.find((o) => o._id === id || o.id === id);
      setExchangeOrder(ord || null);
      const firstBookItem = (ord?.items || []).find(
        (i) => i.bookId && !i.isCombo
      );
      setFromBookId(firstBookItem?.bookId || "");
      setToBookId("");
      setExchangeQty(firstBookItem?.quantity || 1);
      setExchangeError("");
      setShowExchange(true);
      return;
    } else if (type === "Return") {
      if (
        !confirm("Return this order? This will remove it and restock items.")
      ) {
        return;
      }
      // call backend to return and remove order
      axios
        .post(`https://bookstore-c1tt.onrender.com/api/orders/${id}/return`)
        .then(() => {
          setOrders((prev) =>
            prev.filter((o) => String(o._id || o.id) !== String(id))
          );
          // also persist locally
          const updated = orders.filter(
            (o) => String(o._id || o.id) !== String(id)
          );
          saveOrders(updated);
        })
        .catch((err) => {
          console.warn("Failed to return order", err.message);
          alert(
            "Failed to return order: " +
              (err.response?.data?.message || err.message)
          );
        });
      return;
    }

    // Optimistic UI update for non-return actions
    const updatedOrders = orders.map((o) =>
      o._id === id || o.id === id ? { ...o, ...payload } : o
    );
    setOrders(updatedOrders);

    axios
      .put(`https://bookstore-c1tt.onrender.com/api/orders/${id}`, payload)
      .then((res) => {
        const serverOrder = res.data;
        setOrders((prev) =>
          prev.map((o) =>
            o._id === serverOrder._id || o.id === serverOrder._id
              ? serverOrder
              : o
          )
        );
      })
      .catch((err) => {
        console.warn("Failed to update order action", err.message);
        saveOrders(updatedOrders);
        alert("Failed to register action on server; saved locally.");
      });
  };

  const submitExchange = async () => {
    if (!exchangeOrder || !fromBookId || !toBookId) {
      setExchangeError("Please select both books.");
      return;
    }
    if (fromBookId === toBookId) {
      setExchangeError("Selected books must be different.");
      return;
    }
    setExchanging(true);
    setExchangeError("");
    try {
      const id = exchangeOrder._id || exchangeOrder.id;
      const res = await axios.post(
        `https://bookstore-c1tt.onrender.com/api/orders/${id}/exchange`,
        { fromBookId, toBookId, quantity: Number(exchangeQty || 1) }
      );
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (String(o._id || o.id) === String(id) ? updated : o))
      );
      setShowExchange(false);
      setExchangeOrder(null);
    } catch (err) {
      setExchangeError(
        err.response?.data?.message || err.message || "Exchange failed"
      );
    } finally {
      setExchanging(false);
    }
  };

  // Filter orders (support backend shape and localStorage fallback)
  const filteredOrders = orders.filter((order) => {
    const id = String(order._id || order.id || "");
    const name = (order.customer?.name || order.name || "").toLowerCase();
    const phone = (order.customer?.phone || order.phone || "").toString();
    const q = search.toLowerCase();
    return id.includes(q) || name.includes(q) || phone.includes(q);
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">📦 Orders</h2>

      {/* Search Field */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by ID, Name, or Phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {/* <th>Status</th> */}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => {
                  const idDisplay = order._id || order.id || index;
                  const nameDisplay = order.customer?.name || order.name || "";
                  const phoneDisplay =
                    order.customer?.phone || order.phone || "";
                  const items = order.items || [];
                  const totalDisplay = order.totalAmount || order.total || 0;
                  const dateDisplay = order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : order.date || "";
                  const statusValue =
                    order.status || order.status === ""
                      ? order.status
                      : order.status || "pending";
                  return (
                    <tr key={String(idDisplay)} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 break-all">
                        {idDisplay}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nameDisplay}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {phoneDisplay}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {items.map((item, i) => (
                          <div key={i} className="whitespace-normal">
                            {item.title} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        ₹{totalDisplay}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dateDisplay}
                      </td>

                      {/* Status Dropdown */}
                      {/* <td className="p-3 border">
                      <select
                        value={statusValue || "pending"}
                        onChange={(e) =>
                          handleStatusChange(idDisplay, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-green-300"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td> */}

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleAction(idDisplay, "Exchange")}
                            className="btn-secondary"
                          >
                            Exchange
                          </button>
                          <button
                            onClick={() => handleAction(idDisplay, "Return")}
                            className="btn-danger"
                          >
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showExchange && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Exchange Items</h3>
              <button
                className="text-slate-500 hover:text-slate-700"
                onClick={() => setShowExchange(false)}
                disabled={exchanging}
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Which book do you have?
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={fromBookId}
                  onChange={(e) => setFromBookId(e.target.value)}
                >
                  <option value="">Select purchased book</option>
                  {(exchangeOrder?.items || [])
                    .filter((i) => i.bookId && !i.isCombo)
                    .map((i) => (
                      <option key={i.bookId} value={i.bookId}>
                        {i.title} (×{i.quantity})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exchange with which book?
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={toBookId}
                  onChange={(e) => setToBookId(e.target.value)}
                >
                  <option value="">Select replacement book</option>
                  {books.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.title} — ₹{b.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded p-2"
                  value={exchangeQty}
                  onChange={(e) => setExchangeQty(Number(e.target.value || 1))}
                />
              </div>
              {exchangeError && (
                <div className="text-red-600 text-sm">{exchangeError}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => setShowExchange(false)}
                  disabled={exchanging}
                >
                  Cancel
                </button>
                <button
                  className="btn-secondary disabled:opacity-60"
                  onClick={submitExchange}
                  disabled={exchanging}
                >
                  {exchanging ? "Exchanging..." : "Confirm Exchange"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
