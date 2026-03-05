import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../store/cartContextValue";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("");

  const API_BASE = `https://bookstore-c1tt.onrender.com/api/books`;
  const { addToCart } = useContext(CartContext) || {};
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchCombos();
  }, []);

  async function fetchCombos() {
    try {
      const res = await axios.get(
        `https://bookstore-c1tt.onrender.com/api/combos`
      );
      setCombos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load combos:", err);
      setCombos([]);
    }
  }

  async function fetchBooks() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_BASE);
      const list = Array.isArray(res.data) ? res.data : [];
      const deduped = Array.from(
        new Map(list.map((b) => [String(b._id || b.id), b])).values()
      );
      setBooks(deduped);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load books"
      );
    } finally {
      setLoading(false);
    }
  }

  const q = (search || "").trim().toLowerCase();
  let filtered = books;
  if (q) {
    filtered = filtered.filter((b) => {
      return (
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        String(b._id || b.id || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }
  if (selectedTitle) {
    const t = selectedTitle.toLowerCase();
    filtered = filtered.filter((b) => (b.title || "").toLowerCase() === t);
  }
  if (selectedMedium) {
    const m = selectedMedium.toLowerCase();
    filtered = filtered.filter((b) => (b.medium || "").toLowerCase() === m);
  }

  const titleOptions = Array.from(
    new Set(books.map((b) => (b.title || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  const mediumOptions = ["Gujarati", "English"];

  return (
    <div className="p-2 lg:p-6">
      <h1 className="text-xl lg:text-2xl font-bold mb-4">📚 Sell Books</h1>

      <div className="mb-4 lg:mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="text"
          placeholder="Search books by title, author or id..."
          className="w-full md:w-96 p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded w-full md:w-64"
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
        >
          <option value="">All Book Names</option>
          {titleOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded w-full md:w-48"
          value={selectedMedium}
          onChange={(e) => setSelectedMedium(e.target.value)}
        >
          <option value="">All Mediums</option>
          {mediumOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {(selectedTitle || selectedMedium) && (
          <button
            className="btn-secondary !bg-white !text-blue-600 hover:!bg-blue-50 border border-blue-200"
            onClick={() => {
              setSelectedTitle("");
              setSelectedMedium("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading books...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filtered.length > 0 ? (
            filtered.map((book) => (
              <div
                key={String(book._id || book.id)}
                className="bg-white shadow rounded-xl p-4 flex flex-col items-center"
              >
                <img
                  src={
                    book.imageUrl ||
                    book.image ||
                    "https://via.placeholder.com/150"
                  }
                  alt={book.title}
                  className="w-32 h-44 object-contain rounded mb-3"
                />
                <h3 className="font-semibold text-center">{book.title}</h3>
                {book.category && (
                  <span className="text-xs mt-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {book.category}
                  </span>
                )}
                {book.medium && (
                  <span className="text-xs mt-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 ml-2">
                    {book.medium}
                  </span>
                )}
                {/* buyType removed */}
                <p className="text-sm text-gray-500">{book.author}</p>
                {/* Show combos that include this book (match by title) */}
                {combos && combos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    {combos
                      .filter((c) =>
                        (c.books || []).some((t) => {
                          const title =
                            typeof t === "object"
                              ? t.title || t.name || ""
                              : String(t || "");
                          return (
                            title.trim().toLowerCase() ===
                            (book.title || "").trim().toLowerCase()
                          );
                        })
                      )
                      .map((c) => (
                        <button
                          key={c._id || c.id}
                          onClick={() => navigate("/combos")}
                          className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800"
                        >
                          {c.name}
                        </button>
                      ))}
                  </div>
                )}
                <p className="text-green-600 font-bold">
                  {typeof book.price === "number"
                    ? `₹${book.price}`
                    : book.price}
                </p>
                <p className="text-xs text-gray-400">Stock: {book.stock}</p>
                <button
                  disabled={Number(book?.stock) <= 0}
                  className={`mt-3 btn-primary ${
                    Number(book?.stock) <= 0 ? "!bg-gray-400 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => {
                    if (Number(book?.stock) <= 0) {
                      try {
                        alert("❌ This book is out of stock");
                      } catch (_) {}
                      return;
                    }
                    // play animation
                    animateToCart(
                      e.currentTarget.closest("div").querySelector("img")
                    );

                    // add a separate identical line (do not merge by default for this action)
                    if (addToCart) {
                      try {
                        addToCart({ ...book, merge: false });
                      } catch {
                        console.error("addToCart failed");
                      }
                    }

                    // stay on the current page after adding to cart
                  }}
                >
                  {Number(book?.stock) <= 0 ? "❌ Out of Stock" : "➕ Add to Cart"}
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No books found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// animate an image element flying to the nav cart icon
function animateToCart(imgEl) {
  if (!imgEl) return;
  const cartIcon = document.getElementById("nav-cart-icon");
  if (!cartIcon) return;

  const rect = imgEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const clone = imgEl.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.transition =
    "transform 0.8s cubic-bezier(.2,.8,.2,1), opacity 0.8s";
  clone.style.zIndex = 2000;
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);

  // compute translation
  const deltaX =
    cartRect.left + cartRect.width / 2 - (rect.left + rect.width / 2);
  const deltaY =
    cartRect.top + cartRect.height / 2 - (rect.top + rect.height / 2);

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
    clone.style.opacity = "0.6";
  });

  setTimeout(() => {
    clone.remove();
  }, 900);
}
