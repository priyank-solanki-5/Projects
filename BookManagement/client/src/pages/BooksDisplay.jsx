import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BookCollection() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    board: "All",
    medium: "All",
    stream: "All",
    standard: "All",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBase = `https://bookstore-c1tt.onrender.com/api/books`;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(apiBase);
      setBooks(res.data);
    } catch (err) {
      setError(
        "Error fetching books: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      const res = await axios.delete(`${apiBase}/${id}`);
      if (res.status >= 400) throw new Error(`Server ${res.status}`);
      // optimistic refresh
      setBooks((b) => b.filter((x) => x._id !== id && x.id !== id));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async (book) => {
    // For simplicity, prompt for title and send a minimal update payload
    const newTitle = prompt("New title", book.title);
    if (newTitle == null) return; // cancelled
    try {
      const payload = {
        ...book,
        title: newTitle,
        imageUrl: book.imageUrl || book.image,
      };
      const id = book._id || book.id;
      const res = await axios.put(`${apiBase}/${id}`, payload);
      const updated = res.data;
      setBooks((b) =>
        b.map((x) =>
          x._id === updated._id || x.id === updated.id ? updated : x
        )
      );
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const categories = ["All", "Personality", "Love"];
  const boards = ["All", "CBSE", "ICSE"];
  const mediums = ["All", "English", "Hindi"];
  const streams = ["All", "Science", "Arts", "General"];
  const standards = ["All", "STD-9", "STD-10", "STD-11", "STD-12"];

  const handleFilterChange = (key, value) =>
    setFilters({ ...filters, [key]: value });

  const filteredBooks = books.filter((book) => {
    const s = filters.search.trim().toLowerCase();
    return (
      (s === "" ||
        (book.title || "").toLowerCase().includes(s) ||
        (book.author || "").toLowerCase().includes(s) ||
        (book.isbn || "").toLowerCase().includes(s)) &&
      (filters.category === "All" || book.category === filters.category) &&
      (filters.board === "All" || book.board === filters.board) &&
      (filters.medium === "All" || book.medium === filters.medium) &&
      (filters.stream === "All" || book.stream === filters.stream) &&
      (filters.standard === "All" || book.standard === filters.standard)
    );
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg p-4">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <input
          type="text"
          placeholder="Title, author, ISBN..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="space-y-3">
          <select
            className="w-full p-2 border rounded"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="w-full p-2 border rounded"
            value={filters.board}
            onChange={(e) => handleFilterChange("board", e.target.value)}
          >
            {boards.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            className="w-full p-2 border rounded"
            value={filters.medium}
            onChange={(e) => handleFilterChange("medium", e.target.value)}
          >
            {mediums.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="w-full p-2 border rounded"
            value={filters.stream}
            onChange={(e) => handleFilterChange("stream", e.target.value)}
          >
            {streams.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="w-full p-2 border rounded"
            value={filters.standard}
            onChange={(e) => handleFilterChange("standard", e.target.value)}
          >
            {standards.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Book Collection</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book._id || book.id}
                className="bg-white shadow rounded p-4"
              >
                <img
                  src={
                    book.imageUrl ||
                    book.image ||
                    "https://via.placeholder.com/150"
                  }
                  alt={book.title}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="mt-3 font-bold">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
                <p className="text-xs text-gray-400">{book.isbn}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                    {book.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                    {book.board}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                    {book.medium}
                  </span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded">
                    {book.stream}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                    {book.standard}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleUpdate(book)}
                    className="flex-1 btn-warning"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(book._id || book.id)}
                    className="flex-1 btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
