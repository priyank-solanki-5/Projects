import { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
import Card from "../components/Cards";
import axios from "axios";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", jobRole: "", mobileNumber: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const API = `https://bookstore-c1tt.onrender.com/api/employees`;

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API);
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(emp._id || emp.id || "")
        .toLowerCase()
        .includes(q) ||
      (emp.name || "").toLowerCase().includes(q) ||
      (emp.jobRole || emp.role || "").toLowerCase().includes(q) ||
      String(emp.mobileNumber || emp.phone || "").includes(q)
    );
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.jobRole || !form.mobileNumber)
      return setError("Please fill all fields");
    try {
      setError("");
      if (isEditing && editId) {
        // update
        const res = await axios.put(`${API}/${editId}`, {
          name: form.name,
          jobRole: form.jobRole,
          mobileNumber: form.mobileNumber,
        });
        setEmployees((prev) =>
          prev.map((p) =>
            String(p._id || p.id) === String(editId) ? res.data : p
          )
        );
      } else {
        // create
        const res = await axios.post(API, {
          name: form.name,
          jobRole: form.jobRole,
          mobileNumber: form.mobileNumber,
        });
        setEmployees((prev) => [res.data, ...prev]);
      }
      setForm({ name: "", jobRole: "", mobileNumber: "" });
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          (isEditing ? "Failed to update employee" : "Failed to add employee")
      );
    }
  };

  const startEdit = (emp) => {
    setForm({
      name: emp.name || "",
      jobRole: emp.jobRole || emp.jobRoll || "",
      mobileNumber: emp.mobileNumber || emp.phone || "",
    });
    setEditId(emp._id || emp.id);
    setIsEditing(true);
    setShowForm(true);
    setError("");
  };

  const deleteEmployee = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setEmployees((prev) =>
        prev.filter((p) => String(p._id || p.id) !== String(id))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete employee"
      );
    }
  };

  return (
    <div className="p-2 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-bold">👨‍💼 Employees</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-secondary flex items-center"
        >
          <UserPlus className="mr-2 h-5 w-5" />{" "}
          {showForm ? "Cancel" : "Add Employee"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mb-6 bg-white p-4 rounded shadow">
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Full name"
              className="border px-3 py-2 rounded"
            />
            <input
              name="jobRole"
              value={form.jobRole}
              onChange={onChange}
              placeholder="Role (jobRole)"
              className="border px-3 py-2 rounded"
            />
            <input
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={onChange}
              placeholder="Mobile number"
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="mt-4">
            <button className="btn-primary">Save</button>
          </div>
        </form>
      )}

      <div className="flex items-center mb-6">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search by ID, Name, Role, or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <Card key={emp._id || emp.id}>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{emp.name}</h3>
                <p className="text-gray-600">Role: {emp.jobRole || emp.role}</p>
                <p className="text-gray-600">
                  📞 {emp.mobileNumber || emp.phone}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(emp)}
                    className="btn-warning"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp._id || emp.id)}
                    className="btn-danger"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
