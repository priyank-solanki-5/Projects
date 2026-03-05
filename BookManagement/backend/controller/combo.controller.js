import Combo from "../models/combo.models.js";
import Book from "../models/book.models.js";

export const createCombo = async (req, res) => {
  try {
    const { name, description, books, price, stock, imageUrl } = req.body;
    
    // Validation
    if (!name || price == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    if (!books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: "At least one book must be selected" });
    }
    
    // Validate that all books exist and have stock
    const existingBooks = await Book.find({ 
      _id: { $in: books },
      stock: { $gt: 0 } // Only books with stock > 0
    });
    
    if (existingBooks.length !== books.length) {
      return res.status(400).json({ 
        message: "Some selected books are not available in inventory or are out of stock" 
      });
    }
    
    const combo = new Combo({
      name,
      description,
      books,
      price,
      stock,
      imageUrl,
    });
    const saved = await combo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllCombos = async (req, res) => {
  try {
    const combos = await Combo.find()
      .populate('books', 'title author price stock') // Populate book details
      .sort({ createdAt: -1 });
    res.json(combos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getComboById = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) return res.status(404).json({ message: "Combo not found" });
    res.json(combo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const { name, description, books, price, stock, imageUrl } = req.body;
    
    // Validation
    if (name !== undefined && !name?.trim()) {
      return res.status(400).json({ message: "Combo name is required" });
    }
    
    if (price !== undefined && (price == null || price <= 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }
    
    if (books !== undefined) {
      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({ message: "At least one book must be selected" });
      }
      
      // Validate that all books exist (for editing, allow books with 0 stock)
      const existingBooks = await Book.find({ _id: { $in: books } });
      
      if (existingBooks.length !== books.length) {
        return res.status(400).json({ 
          message: "Some selected books are not available in inventory" 
        });
      }
    }
    
    const updated = await Combo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Combo not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const deleted = await Combo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Combo not found" });
    res.json({ message: "Combo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
