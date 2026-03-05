import Order from "../models/order.models.js";
import Book from "../models/book.models.js";

// create an order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, customer, comboId, paymentType, paymentStatus, paymentId, paymentOrderId, paymentSignature } = req.body;
    
    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }
    if (totalAmount == null || totalAmount <= 0) {
      return res.status(400).json({ message: "totalAmount must be a positive number" });
    }

    // Validate stock availability before creating order
    const stockValidationErrors = [];
    for (const item of items) {
      if (item.bookId && !item.isCombo) {
        const book = await Book.findById(item.bookId);
        if (!book) {
          stockValidationErrors.push(`Book with ID ${item.bookId} not found`);
          continue;
        }
        
        const requestedQuantity = Math.max(1, item.quantity || 1);
        if (book.stock < requestedQuantity) {
          stockValidationErrors.push(`Insufficient stock for "${book.title}". Available: ${book.stock}, Requested: ${requestedQuantity}`);
        }
      }
    }

    if (stockValidationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Stock validation failed", 
        errors: stockValidationErrors 
      });
    }

    // Create order
    const order = new Order({ items, totalAmount, customer, comboId, paymentType, paymentStatus, paymentId, paymentOrderId, paymentSignature });
    const saved = await order.save();

    // Decrement stock for each item after successful order creation
    for (const item of items) {
      if (item.bookId && !item.isCombo) {
        const quantity = Math.max(1, item.quantity || 1);
        await Book.findByIdAndUpdate(item.bookId, {
          $inc: { stock: -quantity },
        });
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exchange books within an order: increment stock for returned book, decrement for new book,
// update order flags and swap the item reference by bookId/title where possible
export const exchangeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromBookId, toBookId, quantity } = req.body;
    const qty = Math.max(1, Number(quantity || 1));

    if (!fromBookId || !toBookId) {
      return res
        .status(400)
        .json({ message: "fromBookId and toBookId are required" });
    }
    if (fromBookId === toBookId) {
      return res.status(400).json({ message: "Books must be different" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const fromBook = await Book.findById(fromBookId);
    const toBook = await Book.findById(toBookId);
    if (!fromBook || !toBook)
      return res.status(404).json({ message: "Book not found" });

    // Check if target book has enough stock
    if (toBook.stock < qty) {
      return res.status(400).json({ 
        message: `Insufficient stock for "${toBook.title}". Available: ${toBook.stock}, Requested: ${qty}` 
      });
    }

    // Adjust stocks (best-effort)
    await Book.findByIdAndUpdate(fromBookId, { $inc: { stock: qty } });
    await Book.findByIdAndUpdate(toBookId, { $inc: { stock: -qty } });

    // update order items: try to find matching item to replace
    let replaced = false;
    const updatedItems = (order.items || []).map((it) => {
      const matches = String(it.bookId || "") === String(fromBookId) ||
        (it.title && it.title.toLowerCase() === (fromBook.title || "").toLowerCase());
      if (!replaced && matches) {
        replaced = true;
        return {
          ...it,
          bookId: toBook._id,
          title: toBook.title,
          price: toBook.price,
          quantity: qty,
          isCombo: false,
        };
      }
      return it;
    });

    // if nothing matched, append new item
    if (!replaced) {
      updatedItems.push({
        bookId: toBook._id,
        title: toBook.title,
        price: toBook.price,
        quantity: qty,
        isCombo: false,
      });
    }

    order.items = updatedItems;
    order.isExchange = true;
    order.status = "processing";
    const saved = await order.save();

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// return an order: increment stock for each book item and remove the order entirely
export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // increment stock back for each book item
    for (const it of order.items || []) {
      if (it.bookId) {
        const qty = Math.max(1, Number(it.quantity || 1));
        try {
          await Book.findByIdAndUpdate(it.bookId, { $inc: { stock: qty } });
        } catch (e) {
          // continue even if one update fails
          console.error("Return: stock increment failed", e.message);
        }
      }
    }

    await Order.findByIdAndDelete(id);
    return res.json({ message: "Order returned and removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};