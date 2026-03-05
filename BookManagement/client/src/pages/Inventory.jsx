import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Buttons";
import axios from "axios";

export default function Inventory() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBase = `https://bookstore-c1tt.onrender.com/api/books`;

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(apiBase);
      const list = res.data || [];
      // deduplicate by _id or id (keep first occurrence)
      const deduped = Array.from(
        new Map(list.map((b) => [String(b._id || b.id), b])).values()
      );
      setBooks(deduped);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const sid = String(id || "").trim();
    if (!sid) return alert("Cannot delete: missing id");
    if (!confirm("Delete this book?")) return;
    try {
      await axios.delete(`${apiBase}/${sid}`);
      setBooks((b) => b.filter((x) => String(x._id || x.id) !== sid));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async (book) => {
    // simple sequence of prompts to edit fields quickly
    const newTitle = prompt("Title", book.title);
    if (newTitle == null) return;
    const newAuthor = prompt("Author", book.author);
    if (newAuthor == null) return;
    const newPrice = prompt("Price", book.price);
    if (newPrice == null) return;
    const newStock = prompt("Stock", book.stock);
    if (newStock == null) return;
    const newImage = prompt(
      "Image URL (optional)",
      book.imageUrl || book.image || ""
    );
    const newCategory = prompt(
      "Category (GSEB / CBSE / Other)",
      book.category || "Other"
    );
    const newMedium = prompt(
      "Medium (Gujarati / English)",
      book.medium || "Gujarati"
    );
    const payload = {
      title: newTitle,
      author: newAuthor,
      price: Number(newPrice),
      stock: Number(newStock),
      imageUrl: newImage,
      category: newCategory || "Other",
      medium: newMedium || "Gujarati",
    };
    const id = book._id || book.id;
    try {
      const res = await axios.put(`${apiBase}/${id}`, payload);
      const updated = res.data;
      setBooks((b) =>
        b.map((x) =>
          String(x._id || x.id) === String(updated._id || updated.id)
            ? updated
            : x
        )
      );
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredBooks = books.filter((book) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const id = String(book._id || book.id || "");
    return (
      (book.title || "").toLowerCase().includes(q) ||
      (book.author || "").toLowerCase().includes(q) ||
      id.includes(q)
    );
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 lg:mb-4 gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
          📦 Inventory
        </h2>
        <Button
          onClick={() => navigate("/add-book")}
          variant="primary"
          className="text-xs sm:text-sm"
        >
          <span>➕</span>
          <span>Add Book</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="🔍 Search by title or author..."
          className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Books Table */}
      {error && (
        <div className="text-red-500 mb-3 text-sm sm:text-base">{error}</div>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medium
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book, idx) => (
                  <tr
                    key={`${String(book._id || book.id)}-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book._id || book.id || idx + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <img
                        src={
                          book.imageUrl ||
                          book.image ||
                          "2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys"
                        }
                        alt={book.title}
                        className="w-12 h-16 object-cover mx-auto rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {book.title}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.category || "Other"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.medium || "Gujarati"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof book.price === "number"
                        ? `₹${book.price}`
                        : book.price}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.stock}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => handleEdit(book)}
                          variant="warning"
                          className="px-3 text-xs color-yellow-500"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(book._id || book.id)}
                          variant="danger"
                          className="px-3 text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    ❌ No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
