import { useState, useEffect } from "react";
import axios from "axios";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // customer object when viewing/editing

  const refresh = () => {
    axios
      .get(`https://bookstore-c1tt.onrender.com/api/customers`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const formatted = list.map((c, idx) => ({
          id: c._id || c.id || idx + 1,
          name: c.name,
          phone: c.phone,
          email: c.email,
          orders: c.ordersCount || 0,
          spent: `₹${Number(c.totalSpent || 0).toLocaleString()}`,
        }));
        if (formatted.length) {
          setCustomers(formatted);
          return;
        }
        // fallback to aggregate orders if no customers returned
        throw new Error("no-customers");
      })
      .catch(() => {
        // fallback to previous behavior: aggregate from orders
        axios
          .get(`https://bookstore-c1tt.onrender.com/api/orders`)
          .then((res) => {
            const orders = Array.isArray(res.data) ? res.data : [];
            const map = new Map();
            orders.forEach((o) => {
              const phone = o.customer?.phone || "";
              const name = o.customer?.name || "";
              const email = o.customer?.email || "";
              const total = Number(o.totalAmount || 0);

              const key =
                phone ||
                name ||
                (o.customer && JSON.stringify(o.customer)) ||
                o._id ||
                o.id;
              if (!map.has(key)) {
                map.set(key, {
                  id: key,
                  name,
                  phone,
                  email,
                  orders: 1,
                  spent: total,
                });
              } else {
                const cur = map.get(key);
                cur.orders = (cur.orders || 0) + 1;
                cur.spent = (cur.spent || 0) + total;
                map.set(key, cur);
              }
            });

            const list = Array.from(map.values()).map((c, idx) => ({
              ...c,
              id: idx + 1,
              spent: `₹${Number(c.spent).toLocaleString()}`,
            }));
            setCustomers(list);
          })
          .catch(() => {
            // fallback sample
            setCustomers([]);
          });
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    // fetch orders and aggregate customers
    axios
      .get(`https://bookstore-c1tt.onrender.com/api/orders`)
      .then((res) => {
        const orders = Array.isArray(res.data) ? res.data : [];
        const map = new Map();
        orders.forEach((o) => {
          const phone = o.customer?.phone || "";
          const name = o.customer?.name || "";
          const email = o.customer?.email || "";
          const total = Number(o.totalAmount || 0);

          const key =
            phone ||
            name ||
            (o.customer && JSON.stringify(o.customer)) ||
            o._id ||
            o.id;
          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name,
              phone,
              email,
              orders: 1,
              spent: total,
            });
          } else {
            const cur = map.get(key);
            cur.orders = (cur.orders || 0) + 1;
            cur.spent = (cur.spent || 0) + total;
            map.set(key, cur);
          }
        });

        const list = Array.from(map.values()).map((c, idx) => ({
          ...c,
          id: idx + 1,
          spent: `₹${Number(c.spent).toLocaleString()}`,
        }));
        if (list.length === 0) throw new Error("No orders");
        setCustomers(list);
      })
      .catch((err) => {
        console.warn(
          "Failed to load customers from backend, using sample data",
          err.message
        );
        // fallback sample data (existing static list)
        setCustomers([
          {
            id: 1,
            name: "Aarav Sharma",
            phone: "9876543210",
            email: "aarav@example.com",
            orders: 12,
            spent: "₹5,200",
          },
          {
            id: 2,
            name: "Priya Patel",
            phone: "9123456780",
            email: "priya@example.com",
            orders: 8,
            spent: "₹3,400",
          },
          {
            id: 3,
            name: "Rohan Mehta",
            phone: "9988776655",
            email: "rohan@example.com",
            orders: 15,
            spent: "₹7,800",
          },
          {
            id: 4,
            name: "Sneha Kapoor",
            phone: "9001122334",
            email: "sneha@example.com",
            orders: 5,
            spent: "₹2,100",
          },
          {
            id: 5,
            name: "Arjun Singh",
            phone: "9112233445",
            email: "arjun@example.com",
            orders: 20,
            spent: "₹10,000",
          },
        ]);
      });
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      String(c.name || "")
        .toLowerCase()
        .includes(q) ||
      String(c.phone || "").includes(q) ||
      String(c.email || "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-bold">👥 Customers</h2>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.phone}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.orders}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.spent}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            // open view modal
                            setEditing({ ...c });
                            setModalOpen(true);
                          }}
                          className="btn-secondary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setEditing({ ...c });
                            setModalOpen(true);
                          }}
                          className="btn-warning"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              !confirm(`Delete customer ${c.name || c.phone}?`)
                            )
                              return;
                            // call delete on backend only if id looks like a MongoDB ObjectId
                            const isObjectId = (id) =>
                              /^[0-9a-fA-F]{24}$/.test(String(id));
                            const idToDelete = c.id;
                            if (!isObjectId(idToDelete)) {
                              alert(
                                "This customer record isn't persisted separately in the backend. Refreshing list."
                              );
                              refresh();
                              return;
                            }

                            axios
                              .delete(
                                `https://bookstore-c1tt.onrender.com/api/customers/${idToDelete}`
                              )
                              .then(() => {
                                alert("Customer deleted");
                                refresh();
                              })
                              .catch((err) => {
                                const msg =
                                  err?.response?.data?.message ||
                                  err.message ||
                                  "Failed to delete customer";
                                alert(msg);
                                refresh();
                              });
                          }}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    ❌ No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for View/Edit */}
      {modalOpen && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editing.name || "Customer"}
              </h3>
              <div>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(null);
                  }}
                  className="px-2"
                >
                  ✖
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // submit update
                const payload = {
                  name: editing.name,
                  phone: editing.phone,
                  email: editing.email,
                };
                axios;
                // Determine if this customer has a MongoDB ObjectId
                const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

                const request = isObjectId(editing.id)
                  ? axios.put(
                      `https://bookstore-c1tt.onrender.com/api/customers/${editing.id}`,
                      payload
                    )
                  : axios.post(
                      `https://bookstore-c1tt.onrender.com/api/customers`,
                      payload
                    );

                request
                  .then(() => {
                    alert("Customer saved");
                    setModalOpen(false);
                    setEditing(null);
                    refresh();
                  })
                  .catch((err) => {
                    console.error(err);
                    const msg =
                      err?.response?.data?.message ||
                      err.message ||
                      "Update failed";
                    alert(msg);
                  });
              }}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    value={editing.name || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    value={editing.phone || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, phone: e.target.value })
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    value={editing.email || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, email: e.target.value })
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditing(null);
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
