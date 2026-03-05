import React, { useState } from "react";
import axios from "axios";

const AddBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Other");
  const [medium, setMedium] = useState("Gujarati");
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validation
    if (!title.trim()) {
      setMessage("Please enter a book title.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setMessage("Please enter a valid price (greater than 0).");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setMessage("Please enter a valid stock quantity (0 or greater).");
      return;
    }

    if (image && !/^https?:\/\/.+/.test(image)) {
      setMessage(
        "Please enter a valid image URL (starting with http:// or https://)."
      );
      return;
    }

    const form = e.currentTarget;
    const saveBtn = form.querySelector('button[type="submit"]');
    if (saveBtn) saveBtn.disabled = true;
    try {
      const body = {
        title: title.trim(),
        author: author.trim(),
        imageUrl: image,
        price: Number(price),
        stock: Number(stock),
        category,
        medium,
      };
      const res = await axios.post(
        `https://bookstore-c1tt.onrender.com/api/books`,
        body
      );
      console.log(`http://localhost:5000`);
      if (!res || (res.status && res.status >= 400))
        throw new Error(`Server responded ${res.status}`);
      setMessage("Book saved successfully.");
      setTitle("");
      setAuthor("");
      setImage("");
      setPrice("");
      setStock("");
      // simple refresh so listing pages pick up the new book
      window.location.reload();
    } catch (err) {
      setMessage("Error saving book: " + err.message);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  };

  return (
    <div className="bg-white shadow-md p-4 lg:p-6 rounded-md max-w-md mx-auto">
      <h2 className="text-xl lg:text-2xl font-bold text-green-600 mb-4">
        + Add New Book
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          type="text"
          placeholder="Book Title"
          className="w-full border p-2 rounded"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          type="text"
          placeholder="Author (optional)"
          className="w-full border p-2 rounded"
        />
        <input
          value={image}
          onChange={(e) => {
            setImage(e.target.value);
            setImageError(false);
          }}
          type="text"
          placeholder="Image URL (optional)"
          className="w-full border p-2 rounded"
        />
        {image && (
          <div className="mt-2">
            {!imageError ? (
              <img
                src={image}
                alt="Book preview"
                className="w-32 h-40 object-cover border rounded"
                onLoad={() => setImageError(false)}
                onError={() => setImageError(true)}
              />
            ) : (
              <p className="text-sm text-red-600">
                Could not load image preview.
              </p>
            )}
          </div>
        )}
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          className="w-full border p-2 rounded"
        />
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          type="number"
          min="0"
          placeholder="Stock Quantity"
          className="w-full border p-2 rounded"
        />
        <label className="block font-medium">Category:</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="category"
              value="GSEB"
              checked={category === "GSEB"}
              onChange={() => setCategory("GSEB")}
            />{" "}
            GSEB
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="category"
              value="CBSE"
              checked={category === "CBSE"}
              onChange={() => setCategory("CBSE")}
            />{" "}
            CBSE
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="category"
              value="Other"
              checked={category === "Other"}
              onChange={() => setCategory("Other")}
            />{" "}
            Other
          </label>
        </div>
        <label className="block font-medium mt-3">Medium:</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="medium"
              value="Gujarati"
              checked={medium === "Gujarati"}
              onChange={() => setMedium("Gujarati")}
            />{" "}
            Gujarati
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="medium"
              value="English"
              checked={medium === "English"}
              onChange={() => setMedium("English")}
            />{" "}
            English
          </label>
        </div>
        <button type="submit" className="btn-primary">
          Save Book
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};

export default AddBook;
