import React, { useState, useEffect } from "react";
import axios from "axios";

const AddCombo = ({ onSaved, comboToEdit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Fetch available books from inventory
  useEffect(() => {
    const fetchAvailableBooks = async () => {
      try {
        setLoadingBooks(true);
        const response = await axios.get(
          "https://bookstore-c1tt.onrender.com/api/books"
        );
        const books = Array.isArray(response.data) ? response.data : [];
        // Filter books that have stock available (or include all books if editing)
        const availableBooks = comboToEdit
          ? books
          : books.filter((book) => book.stock > 0);
        setAvailableBooks(availableBooks);
      } catch (error) {
        console.error("Failed to fetch books:", error);
        setAvailableBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchAvailableBooks();
  }, [comboToEdit]);

  // Populate form when editing
  useEffect(() => {
    if (comboToEdit) {
      setName(comboToEdit.name || "");
      setDescription(comboToEdit.description || "");
      setPrice(comboToEdit.price?.toString() || "");
      setStock(comboToEdit.stock?.toString() || "");
      setImageUrl(comboToEdit.imageUrl || "");

      // Set selected books if combo has books
      if (comboToEdit.books && Array.isArray(comboToEdit.books)) {
        setSelectedBooks(comboToEdit.books);
      }
    } else {
      // Reset form for new combo
      setName("");
      setDescription("");
      setSelectedBooks([]);
      setPrice("");
      setStock("");
      setImageUrl("");
    }
  }, [comboToEdit]);

  // Handle book selection
  const handleBookToggle = (book) => {
    setSelectedBooks((prev) => {
      const isSelected = prev.some((selected) => selected._id === book._id);
      if (isSelected) {
        return prev.filter((selected) => selected._id !== book._id);
      } else {
        return [...prev, book];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (selectedBooks.length === 0) {
      alert("Please select at least one book from the available inventory.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a combo name.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      alert("Please enter a valid stock quantity (0 or greater).");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name,
        description,
        books: selectedBooks.map((book) => book._id), // Use book IDs instead of titles
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        imageUrl,
      };

      let res;
      if (comboToEdit) {
        // Update existing combo
        res = await axios.put(
          `https://bookstore-c1tt.onrender.com/api/combos/${comboToEdit._id}`,
          body
        );
      } else {
        // Create new combo
        res = await axios.post(
          `https://bookstore-c1tt.onrender.com/api/combos`,
          body
        );
      }

      if (res && res.data) {
        if (!comboToEdit) {
          // Only reset form for new combos
          setName("");
          setDescription("");
          setSelectedBooks([]);
          setPrice("");
          setStock("");
          setImageUrl("");
        }
        onSaved && onSaved(res.data);
      }
    } catch (err) {
      console.error(err);
      alert(
        "Failed to save combo: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        {comboToEdit ? "✏️ Edit Combo" : "➕ Add New Combo"}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Combo Name"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded"
          rows="3"
        ></textarea>
        {/* Book Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Books from Available Inventory:
          </label>

          {loadingBooks ? (
            <div className="text-center py-4">
              <div className="text-gray-500">Loading available books...</div>
            </div>
          ) : availableBooks.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-red-500">
                No books available in inventory
              </div>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
              <div className="grid grid-cols-1 gap-2">
                {availableBooks.map((book) => (
                  <label
                    key={book._id}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                      selectedBooks.some(
                        (selected) => selected._id === book._id
                      )
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-white border-2 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBooks.some(
                        (selected) => selected._id === book._id
                      )}
                      onChange={() => handleBookToggle(book)}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{book.title}</div>
                      <div className="text-xs text-gray-500">
                        Author: {book.author} | Stock: {book.stock} | Price: ₹
                        {book.price}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedBooks.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Selected Books ({selectedBooks.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedBooks.map((book) => (
                  <span
                    key={book._id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {book.title}
                    <button
                      type="button"
                      onClick={() => handleBookToggle(book)}
                      className="ml-1 h-4 w-4 rounded-full hover:bg-green-200 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
        />
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          type="number"
          min="0"
          placeholder="Stock Quantity"
          className="w-full border p-2 rounded"
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          type="text"
          placeholder="Image URL (optional)"
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-3">
          <button disabled={saving} className="btn-primary">
            {saving
              ? comboToEdit
                ? "Updating..."
                : "Saving..."
              : comboToEdit
              ? "Update Combo"
              : "Save Combo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCombo;
