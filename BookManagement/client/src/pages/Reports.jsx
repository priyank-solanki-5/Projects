import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Button from "../components/Buttons";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [mode, setMode] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [reportRows, setReportRows] = useState([]);
  const [reportTotals, setReportTotals] = useState({ count: 0, amount: 0 });
  const [history, setHistory] = useState([]);
  const reportRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios
        .get("https://bookstore-c1tt.onrender.com/api/orders")
        .then((r) => r.data),
      axios
        .get("https://bookstore-c1tt.onrender.com/api/customers")
        .then((r) => r.data),
    ])
      .then(([ordersRes, customersRes]) => {
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setCustomers(Array.isArray(customersRes) ? customersRes : []);
      })
      .catch((err) => {
        console.warn(
          "Reports fetch failed, falling back to empty data",
          err.message
        );
        setOrders([]);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("reportHistory");
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* empty */
    }
  }, []);

  function saveHistory(entry) {
    try {
      const next = [entry, ...history].slice(0, 50);
      setHistory(next);
      localStorage.setItem("reportHistory", JSON.stringify(next));
    } catch {
      /* empty */
    }
  }

  // compute accurate sales stats: use PAID orders only for sales numbers
  const paidOrders = orders.filter(
    (o) =>
      String(o.paymentStatus || "").toLowerCase() === "paid" &&
      o.status !== "cancelled"
  );
  const totalSales = paidOrders.reduce(
    (s, o) => s + Number(o.totalAmount || 0),
    0
  );
  const ordersCount = paidOrders.length;
  const customersCount =
    customers.length ||
    new Set(paidOrders.map((o) => o.customer?.phone || o.customer?.name)).size;
  // simple profit estimate: assume 20% margin
  const profit = Math.round(totalSales * 0.2);

  // breakdown: books vs combos vs returns/exchanges
  let booksSold = 0;
  let combosSold = 0;
  let returns = 0;
  let exchanges = 0;

  orders.forEach((o) => {
    if (o.isReturn || o.status === "cancelled") {
      returns += 1;
      return;
    }
    if (
      Array.isArray(o.items) &&
      String(o.paymentStatus || "").toLowerCase() === "paid"
    ) {
      o.items.forEach((it) => {
        if (it.isCombo) combosSold += Number(it.quantity || 0);
        else booksSold += Number(it.quantity || 0);
      });
    }
    if (o.isExchange || o.status === "processing") exchanges += 1;
  });

  const salesStats = [
    { label: "Books Sold", value: booksSold, color: "bg-green-500" },
    { label: "Combos Sold", value: combosSold, color: "bg-blue-500" },
    { label: "Returns", value: returns, color: "bg-red-500" },
    { label: "Exchanges", value: exchanges, color: "bg-yellow-500" },
  ];

  // Determine the maximum value across stats so bars scale relative to the highest metric
  const maxStatValue = Math.max(
    1,
    ...salesStats.map((s) => Number(s.value || 0))
  );

  // Count-up animation hook
  function useCountUp(target, durationMs = 1000) {
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

  const animTotalSales = useCountUp(totalSales, 900);
  const animOrders = useCountUp(ordersCount, 900);
  const animCustomers = useCountUp(customersCount, 900);
  const animProfit = useCountUp(profit, 900);

  const exportCsv = () => {
    // create CSV from orders
    const rows = [
      ["Order ID", "Customer", "Phone", "Total", "Status", "CreatedAt"],
      ...orders.map((o) => [
        o._id || o.id,
        o.customer?.name || "",
        o.customer?.phone || "",
        o.totalAmount || 0,
        o.status || "",
        o.createdAt || "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportWord = () => {
    // Build a simple HTML report for Word
    const rowsHtml = orders
      .map(
        (o) => `
        <tr>
          <td>${o._id || o.id || ""}</td>
          <td>${o.customer?.name || ""}</td>
          <td>${o.customer?.phone || ""}</td>
          <td>${o.totalAmount || 0}</td>
          <td>${o.status || ""}</td>
          <td>${o.createdAt || ""}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Reports</title></head>
      <body>
        <h2>Reports Summary</h2>
        <p><strong>Total Sales:</strong> ₹${totalSales.toLocaleString()}</p>
        <p><strong>Orders:</strong> ${ordersCount}</p>
        <p><strong>Customers:</strong> ${customersCount}</p>
        <p><strong>Profit (est.):</strong> ₹${profit.toLocaleString()}</p>
        <h3>Orders</h3>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total</th>
              <th>Status</th>
              <th>CreatedAt</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date().toISOString()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function generateReport() {
    if (!Array.isArray(orders) || orders.length === 0) {
      setReportRows([]);
      setReportTotals({ count: 0, amount: 0 });
      return;
    }

    const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);
    const fmtMonth = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    };

    let grouped = new Map();
    let filtered = orders;

    if (mode === "daily") {
      const day = selectedDate;
      filtered = orders.filter(
        (o) => fmtDate(o.createdAt || o.created_at || o.date) === day
      );
      filtered.forEach((o) => {
        const key = fmtDate(o.createdAt || o.created_at || o.date);
        const prev = grouped.get(key) || { date: key, count: 0, amount: 0 };
        prev.count += 1;
        prev.amount += Number(o.totalAmount || 0);
        grouped.set(key, prev);
      });
    } else {
      const month = selectedMonth;
      filtered = orders.filter(
        (o) => fmtMonth(o.createdAt || o.created_at || o.date) === month
      );
      filtered.forEach((o) => {
        const key = fmtDate(o.createdAt || o.created_at || o.date);
        const prev = grouped.get(key) || { date: key, count: 0, amount: 0 };
        prev.count += 1;
        prev.amount += Number(o.totalAmount || 0);
        grouped.set(key, prev);
      });
    }

    const rows = Array.from(grouped.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const totals = rows.reduce(
      (acc, r) => ({
        count: acc.count + r.count,
        amount: acc.amount + r.amount,
      }),
      { count: 0, amount: 0 }
    );
    setReportRows(rows);
    setReportTotals(totals);

    const stamp = new Date().toISOString();
    saveHistory({ id: stamp, mode, selectedDate, selectedMonth, totals });
  }

  function useHistory(entry) {
    if (!entry) return;
    setMode(entry.mode);
    setSelectedDate(entry.selectedDate);
    setSelectedMonth(entry.selectedMonth);
    setTimeout(generateReport, 0);
  }

  function deleteHistory(id) {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    try {
      localStorage.setItem("reportHistory", JSON.stringify(next));
    } catch {}
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem("reportHistory");
    } catch {}
  }

  const exportPdf = async () => {
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("https://esm.sh/html2canvas@1.4.1"),
        import("https://esm.sh/jspdf@2.5.1"),
      ]);
      const node = reportRef.current || document.body;
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        heightLeft -= pageHeight;
      }

      pdf.save(`report-${new Date().toISOString()}.pdf`);
    } catch (e) {
      alert("PDF export failed. You can still use the browser's Print to PDF.");
      console.error(e);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto" ref={reportRef}>
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">📊 Reports</h2>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Report Type</label>
          <select
            className="w-full p-2 border rounded"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {mode === "daily" ? (
          <div>
            <label className="block text-sm mb-1">Select Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-1">Select Month</label>
            <input
              type="month"
              className="w-full p-2 border rounded"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        )}
        <div>
          <Button onClick={generateReport} className="w-full" variant="primary">
            Generate
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCsv} className="flex-1" variant="secondary">
            Export CSV
          </Button>
          <Button onClick={exportWord} className="flex-1" variant="secondary">
            Export Word
          </Button>
        </div>
      </div>

      {/* Generated Report */}
      {reportRows && reportRows.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {mode === "daily"
                  ? `Daily Report (${selectedDate})`
                  : `Monthly Report (${selectedMonth})`}
              </h3>
              <div className="text-sm text-gray-600">
                Total Orders: <strong>{reportTotals.count}</strong> | Total
                Sales: <strong>₹{reportTotals.amount.toLocaleString()}</strong>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportRows.map((r) => (
                  <tr key={r.date} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {r.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {r.count}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{Number(r.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading reports...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Total Sales</h3>
              <p className="text-2xl font-bold text-green-600 transition-all">
                ₹{animTotalSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Orders</h3>
              <p className="text-2xl font-bold text-blue-600">{animOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Customers</h3>
              <p className="text-2xl font-bold text-purple-600">
                {animCustomers}
              </p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold">Profit</h3>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{animProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Sales Breakdown</h3>
            <div className="space-y-4">
              {salesStats.map((stat, index) => {
                const val = Number(stat.value || 0);
                const percentage = Math.round((val / maxStatValue) * 100);
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{stat.label}</span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${stat.color}`}
                        style={{
                          width: `${percentage}%`,
                          transition: "width 800ms ease-out",
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* History */}
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Report History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">
                No history yet. Generate a report to save it here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        When
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filter
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(h.id).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {h.mode}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {h.mode === "daily"
                            ? h.selectedDate
                            : h.selectedMonth}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {h.totals?.count || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{Number(h.totals?.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => useHistory(h)}
                              className="btn-primary text-xs px-2 py-1"
                            >
                              Re-run
                            </button>
                            <button
                              onClick={() => deleteHistory(h.id)}
                              className="btn-danger text-xs px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
/*give me payment integration in chack out button if user select resor pay impliment resorpay and explain in datails.*/
