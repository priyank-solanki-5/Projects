import Book from "../models/book.models.js";

// get books code

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get a single book

export const getBookById = async (req, res) => {
  try {
    const booksById = await Book.findById(req.params.id);
    if (!booksById) return res.status(400).json({ message: "book not found" });
    res.json(booksById);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// create a book
export const createBook = async (req, res) => {
  try {
    const { title, author, price, stock, imageUrl, image, category, medium } =
      req.body;
    const img = imageUrl || image || null;
    if (!title || price == null || stock == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const bookDoc = new Book({
      title,
      author,
      price,
      stock,
      imageUrl: img,
      category,
      medium,
    });
    const saved = await bookDoc.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update a book
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Book.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete a book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
